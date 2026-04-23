/* SecurData.Pro — Blog Media Library (GitHub repo storage)
   - upload (file picker + drag&drop)
   - resize/compress via Canvas
   - list/reuse/delete assets in assets/uploads/blog/
   Requires a GitHub fine-grained PAT with Contents: Read/Write stored in localStorage key sdp_gh_token
*/

(function (global) {
  'use strict';

  var OWNER = 'Profitpickers';
  var REPO  = 'securdata.pro';
  var BRANCH = null; // null = default branch

  var UPLOAD_DIR = 'assets/uploads/blog';

  function $(id){ return document.getElementById(id); }

  function toast(msg, type) {
    if (typeof global.toast === 'function') return global.toast(msg, type);
    console.log(msg);
  }

  function getToken() {
    return (localStorage.getItem('sdp_gh_token') || '').trim();
  }

  function apiBase() { return 'https://api.github.com'; }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function b64FromUint8(u8) {
    var CHUNK = 0x8000;
    var i = 0;
    var out = '';
    for (; i < u8.length; i += CHUNK) {
      out += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
    }
    return btoa(out);
  }

  function toIso() { return new Date().toISOString(); }

  function guessExt(mime) {
    if (mime === 'image/webp') return 'webp';
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/png')  return 'png';
    return 'bin';
  }

  function slugFileName(name) {
    return String(name || 'image')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '')
      .replace(/-+/g, '-')
      .replace(/^[-.]+|[-.]+$/g, '')
      .substring(0, 80) || ('image-' + Date.now());
  }

  function ghFetch(path, opts) {
    var token = getToken();
    if (!token) {
      toast('Imposta prima il GitHub Token (Settings) per usare la libreria media.', 'err');
      return Promise.reject(new Error('Missing token'));
    }
    opts = opts || {};
    opts.headers = opts.headers || {};
    opts.headers['Authorization'] = 'token ' + token;
    opts.headers['Accept'] = 'application/vnd.github+json';
    return fetch(apiBase() + path, opts).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error('GitHub API ' + r.status + ': ' + (t || r.statusText));
        });
      }
      return r.json();
    });
  }

  function listImages() {
    var refQ = BRANCH ? ('?ref=' + encodeURIComponent(BRANCH)) : '';
    return ghFetch('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(UPLOAD_DIR) + refQ, {
      method: 'GET'
    }).then(function (items) {
      if (!Array.isArray(items)) return [];
      return items
        .filter(function (it) { return it && it.type === 'file' && /^image\//.test(it.content_type || '') || /\.(png|jpe?g|webp|gif|svg)$/i.test(it.name||''); })
        .map(function (it) {
          return {
            name: it.name,
            path: it.path,
            sha: it.sha,
            size: it.size,
            download_url: it.download_url
          };
        });
    }).catch(function (e) {
      // Directory missing: treat as empty
      if (/404/.test(String(e && e.message))) return [];
      throw e;
    });
  }

  function ensureDirNote() {
    // GitHub contents API doesn't create directories; they exist when a file exists.
    // No-op, kept for clarity.
    return Promise.resolve();
  }

  function putFile(path, contentBase64, msg, sha) {
    var body = {
      message: msg,
      content: contentBase64
    };
    if (sha) body.sha = sha;
    if (BRANCH) body.branch = BRANCH;

    return ghFetch('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function deleteFile(path, sha, msg) {
    var body = { message: msg, sha: sha };
    if (BRANCH) body.branch = BRANCH;
    return ghFetch('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function loadImageBitmap(file) {
    // Use createImageBitmap when available (faster) else fallback
    if (global.createImageBitmap) return createImageBitmap(file);
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  function resizeToBlob(file, opts) {
    opts = opts || {};
    var maxW = opts.maxW || 1600;
    var maxH = opts.maxH || 1600;
    var mime = opts.mime || 'image/webp';
    var quality = (typeof opts.quality === 'number') ? opts.quality : 0.82;

    return loadImageBitmap(file).then(function (bmp) {
      var w = bmp.width || bmp.naturalWidth;
      var h = bmp.height || bmp.naturalHeight;
      var scale = Math.min(1, maxW / w, maxH / h);
      var tw = Math.max(1, Math.round(w * scale));
      var th = Math.max(1, Math.round(h * scale));

      var canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bmp, 0, 0, tw, th);

      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          resolve({ blob: blob, width: tw, height: th });
        }, mime, quality);
      });
    });
  }

  function uploadImage(file, options) {
    options = options || {};
    var mime = options.mime || 'image/webp';

    return ensureDirNote().then(function () {
      return resizeToBlob(file, {
        maxW: options.maxW || 1600,
        maxH: options.maxH || 1600,
        mime: mime,
        quality: (typeof options.quality === 'number') ? options.quality : 0.82
      });
    }).then(function (res) {
      var ext = guessExt(mime);
      var base = slugFileName(file.name.replace(/\.[^.]+$/, ''));
      var fname = base + '-' + Date.now() + '.' + ext;
      var path = UPLOAD_DIR + '/' + fname;

      return res.blob.arrayBuffer().then(function (buf) {
        var u8 = new Uint8Array(buf);
        var b64 = b64FromUint8(u8);
        return putFile(path, b64, 'Upload blog image ' + fname + ' (' + toIso() + ')');
      }).then(function (r) {
        var url = './' + path; // relative for site
        return {
          path: path,
          name: fname,
          url: url,
          api: r
        };
      });
    });
  }

  function renderLibrary(containerEl, onInsert) {
    containerEl.innerHTML = '<div style="color:#718096;font-size:.82rem;">Caricamento immagini…</div>';
    return listImages().then(function (imgs) {
      if (!imgs.length) {
        containerEl.innerHTML = '<div style="color:#718096;font-size:.82rem;">Nessuna immagine caricata.</div>';
        return;
      }
      containerEl.innerHTML = imgs.map(function (it) {
        var relUrl = './' + it.path;
        return '' +
          '<div class="tcrd" style="align-items:center;">' +
          '  <img src="' + esc(relUrl) + '" style="width:44px;height:44px;border-radius:10px;object-fit:cover;border:1px solid rgba(99,179,237,.15);background:#0a0e1a" loading="lazy" />' +
          '  <div class="ti">' +
          '    <h4 style="margin:0">' + esc(it.name) + '</h4>' +
          '    <p style="margin:2px 0 0">' + esc(relUrl) + '</p>' +
          '  </div>' +
          '  <div class="pca">' +
          '    <button class="bs" style="padding:.28rem .6rem;font-size:.7rem;" data-copy="' + esc(relUrl) + '">Copia URL</button>' +
          '    <button class="bp" style="padding:.28rem .6rem;font-size:.7rem;" data-insert="' + esc(relUrl) + '">Inserisci</button>' +
          '    <button class="bd" style="padding:.28rem .6rem;font-size:.7rem;" data-del-path="' + esc(it.path) + '" data-del-sha="' + esc(it.sha) + '">Elimina</button>' +
          '  </div>' +
          '</div>';
      }).join('');

      containerEl.querySelectorAll('button[data-copy]').forEach(function (b) {
        b.onclick = function () {
          var url = b.getAttribute('data-copy');
          navigator.clipboard.writeText(url).then(function(){ toast('URL copiato!', 'ok'); })
            .catch(function(){ toast('Impossibile copiare', 'err'); });
        };
      });

      containerEl.querySelectorAll('button[data-insert]').forEach(function (b) {
        b.onclick = function () {
          var url = b.getAttribute('data-insert');
          if (typeof onInsert === 'function') onInsert(url);
        };
      });

      containerEl.querySelectorAll('button[data-del-path]').forEach(function (b) {
        b.onclick = function () {
          var p = b.getAttribute('data-del-path');
          var sha = b.getAttribute('data-del-sha');
          if (!confirm('Eliminare questa immagine dal repo?')) return;
          deleteFile(p, sha, 'Delete blog image ' + p + ' (' + toIso() + ')')
            .then(function(){ toast('Immagine eliminata', 'ok'); return renderLibrary(containerEl, onInsert); })
            .catch(function(e){ toast('Errore eliminazione: ' + e.message, 'err'); });
        };
      });
    });
  }

  function bindUploader(dropEl, fileInputEl, onUploaded) {
    function handleFiles(files) {
      if (!files || !files.length) return;
      var arr = Array.prototype.slice.call(files);
      // sequential uploads to avoid hitting API limits
      var p = Promise.resolve();
      arr.forEach(function (f) {
        if (!/^image\//.test(f.type)) {
          toast('File non immagine: ' + f.name, 'err');
          return;
        }
        p = p.then(function () {
          toast('Carico ' + f.name + '…');
          return uploadImage(f, { mime: 'image/webp', maxW: 1600, maxH: 1600, quality: 0.82 })
            .then(function (r) {
              toast('Caricata: ' + r.name, 'ok');
              if (typeof onUploaded === 'function') onUploaded(r);
            });
        }).catch(function (e) {
          toast('Errore upload: ' + e.message, 'err');
        });
      });
    }

    if (fileInputEl) {
      fileInputEl.onchange = function () {
        handleFiles(fileInputEl.files);
        fileInputEl.value = '';
      };
    }

    if (dropEl) {
      dropEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropEl.classList.add('drag');
      });
      dropEl.addEventListener('dragleave', function () {
        dropEl.classList.remove('drag');
      });
      dropEl.addEventListener('drop', function (e) {
        e.preventDefault();
        dropEl.classList.remove('drag');
        handleFiles(e.dataTransfer.files);
      });
    }
  }

  global.SDP_BlogMedia = {
    OWNER: OWNER,
    REPO: REPO,
    UPLOAD_DIR: UPLOAD_DIR,
    listImages: listImages,
    uploadImage: uploadImage,
    deleteFile: deleteFile,
    renderLibrary: renderLibrary,
    bindUploader: bindUploader
  };

})(window);
