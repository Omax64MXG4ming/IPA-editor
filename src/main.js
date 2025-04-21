const JSZip = require('./jszip.min.js');
const Plist = require('@plist/plist');
const FileSaver = require('./FileSaver.min.js');
const editLoader = document.getElementById('editorLoader');
const placeholder = document.getElementById('placeholder');
const form = document.getElementById('plist-form');
const statusText = document.getElementById('editProcessStatus')
let zipFileGlobal
let parsedPlistGlobal
window.handleFileUpload = function(event) {
  try {
    const IPAFile = event.target.files[0];
    if (!IPAFile) return;
    if (!IPAFile.name.toLowerCase().endsWith('.ipa')) {
      alert('Please select an IPA file.');
      return;
    }
    console.log(IPAFile.name);
    const uploadBtn = document.getElementById('upload-button');
    const loader = document.getElementById('loader');
    uploadBtn.disabled = true;
    loader.classList.remove('hidden');
    editLoader.classList.remove('hidden');
    form.classList.add('hidden');
    uploadBtn.firstChild.nodeValue = 'Extracting IPA... ';

    clearFormData();

    const zip = new JSZip();
    zip.loadAsync(IPAFile)
      .then(function(zipFile) {
        zipFileGlobal = zipFile
        const plistPath = Object.keys(zipFile.files).find(fileName => fileName.startsWith('Payload/') && fileName.endsWith('.app/Info.plist'));

        if (!plistPath) {
          console.error('Payload folder or Info.plist not found in IPA');
          resetElements('Payload folder or Info.plist not found in IPA');

          return;
        }

        zipFile.file(plistPath).async('arraybuffer')
          .then(function(data) {
            parsedPlistGlobal = Plist.parse(data);
            console.log('Parsed Info.plist:', parsedPlistGlobal);

            resetElements();
            startEditor(parsedPlistGlobal, zipFile);
          })
          .catch(err => {
            console.error('Error parsing Info.plist:', err);
            resetElements('Error parsing Info.plist');
          });
      })
      .catch(function(err) {
        console.error('Error extracting IPA:', err);
        resetElements('Error extracting IPA');
      });
  } catch (err) {
    console.error('Error handling file upload:', err);
    resetElements('Error handling file upload');
  }
};

function resetElements(errorMessage = '') {

  const uploadBtn = document.getElementById('upload-button');
  const loader = document.getElementById('loader');

  if (errorMessage) {
    alert(errorMessage);
    editLoader.classList.add('hidden');
    placeholder.classList.remove('hidden');
    form.classList.add('hidden');
    clearFormData();
    zipFileGlobal = null
    parsedPlistGlobal = null
  }
  statusText.textContent = ''
  statusText.classList.add('hidden')
  uploadBtn.firstChild.nodeValue = 'Upload IPA';
  uploadBtn.disabled = false;
  loader.classList.add('hidden');
}

function startEditor(parsedPlist, zipFile) {
  clearFormData();
  placeholder.classList.add('hidden');

  const bundleIdentifier = parsedPlist['CFBundleIdentifier'] || '';
  const bundleName = parsedPlist['CFBundleName'] || '';
  const displayName = parsedPlist['CFBundleDisplayName'] || '';
  const bundleVersion = parsedPlist['CFBundleVersion'] || '';
  const shortVersionString = parsedPlist['CFBundleShortVersionString'] || '';
  const minIOSVersion = parsedPlist['MinimumOSVersion'] || '';
  const SupportsDocumentBrowser = parsedPlist['UISupportsDocumentBrowser'] || false
  const FileSharingEnabled = parsedPlist['UIFileSharingEnabled'] || false
  const SupportsOpeningDocumentsInPlace = parsedPlist['LSSupportsOpeningDocumentsInPlace'] || false
  document.getElementById('bundle-identifier').value = bundleIdentifier;
  document.getElementById('bundle-name').value = bundleName;
  document.getElementById('display-name').value = displayName;
  document.getElementById('bundle-version').value = bundleVersion;
  document.getElementById('short-version-string').value = shortVersionString;
  document.getElementById('min-ios-version').value = minIOSVersion;
  console.log("FileSharingEnabled", FileSharingEnabled)
  console.log("LSSupportsOpeningDocumentsInPlace",SupportsOpeningDocumentsInPlace)
  console.log("UISupportsDocumentBrowser",SupportsDocumentBrowser)
  if ( (FileSharingEnabled && SupportsOpeningDocumentsInPlace) || SupportsDocumentBrowser) {
    document.getElementById('file-access').checked = true;
  }

  const iconName = getMainIconName(parsedPlist);

  if (!iconName) {
    console.error('Main icon not found in Info.plist');
    resetElements('Main icon not found in Info.plist');
    return;
  }
  console.log(iconName)

  const iconFile = Object.keys(zipFile.files).find(fileName => fileName.startsWith(`Payload/`) && fileName.includes(`.app/${iconName}`));

  if (!iconFile) {
    console.error(`Icon file '${iconFile}' not found in IPA`);
    resetElements(`Icon file '${iconFile}' not found in IPA`);
    return;
  }
  zipFile.file(iconFile).async('blob')
    .then(function(blob) {
      const reader = new FileReader();
      reader.onloadend = function() {
        const imgSrc = reader.result;
        document.getElementById('app-icon').src = imgSrc;
      };
      reader.readAsDataURL(blob);
    })
    .catch(err => {
      console.error('Error reading icon file:', err);
      resetElements('Error reading icon file');
    });
  editLoader.classList.add('hidden');
  form.classList.remove('hidden');
}

function clearFormData() {
  document.getElementById('bundle-identifier').value = '';
  document.getElementById('bundle-name').value = '';
  document.getElementById('display-name').value = '';
  document.getElementById('bundle-version').value = '';
  document.getElementById('short-version-string').value = '';
  document.getElementById('min-ios-version').value = '';
  document.getElementById('app-icon').src = '';
  document.getElementById('file-access').checked = false;
}

function getMainIconName(parsedPlist) {
  const icons = parsedPlist['CFBundleIcons'];
  if (icons && icons['CFBundlePrimaryIcon'] && icons['CFBundlePrimaryIcon']['CFBundleIconFiles']) {
    const iconFiles = icons['CFBundlePrimaryIcon']['CFBundleIconFiles'];
    if (Array.isArray(iconFiles) && iconFiles.length > 0) {
      return iconFiles[0]; // Return the first icon filename for simplicity
    }
  }

  // If CFBundleIcons structure is not found, fallback to CFBundleIconFiles
  const iconFiles = parsedPlist['CFBundleIconFiles'];
  if (Array.isArray(iconFiles) && iconFiles.length > 0) {
    return iconFiles[0]; //  first icon ( there migh be better approach)
  }

  return null;
}
document.addEventListener("submit", (event) => {
  event.preventDefault()
  try {
    const validForm = form.reportValidity();
    if (validForm) {
      form.classList.add('hidden')
      editLoader.classList.remove('hidden')
      statusText.classList.remove('hidden')
      statusText.textContent = "Building Plist"
      const SupportsFilesApp = document.getElementById('file-access').checked;
      parsedPlistGlobal['CFBundleIdentifier'] = document.getElementById('bundle-identifier').value;
      parsedPlistGlobal['CFBundleName'] = document.getElementById('bundle-name').value;
      parsedPlistGlobal['CFBundleDisplayName'] = document.getElementById('display-name').value;
      parsedPlistGlobal['CFBundleVersion'] = document.getElementById('bundle-version').value;
      parsedPlistGlobal['CFBundleShortVersionString'] = document.getElementById('short-version-string').value;
      parsedPlistGlobal['MinimumOSVersion'] = document.getElementById('min-ios-version').value;
      
      parsedPlistGlobal['LSSupportsOpeningDocumentsInPlace'] = SupportsFilesApp;
      parsedPlistGlobal['UISupportsDocumentBrowser'] = SupportsFilesApp;
      parsedPlistGlobal['UIFileSharingEnabled'] = SupportsFilesApp;

      const serializedPlist = Plist.serialize(parsedPlistGlobal)
      const payloadFolder = Object.keys(zipFileGlobal.files).find(fileName => fileName.startsWith('Payload/') && fileName.endsWith('.app/Info.plist'));

      if (payloadFolder) {
        zipFileGlobal.file(payloadFolder, serializedPlist);
        statusText.textContent = 'Building Ipa!';
        zipFileGlobal.generateAsync({
            type: 'blob',
            mimeType: "application/octet-stream'",
            compression: "DEFLATE"
          })
          .then(function(content) {
            // content = new Blob([content], { type: 'application/octet-stream' });
            statusText.textContent = 'Starting download!';
            zipFileGlobal = null
            parsedPlistGlobal = null
            FileSaver.saveAs(content, 'updated.ipa')
            resetElements();
            placeholder.classList.remove('hidden');
            editLoader.classList.add('hidden')
            clearFormData()
          })
          .catch(function(err) {
            console.error('Error generating updated IPA:', err);
            resetElements('Error generating updated IPA');
          });
      } else {
        resetElements('Payload folder or Info.plist not found in IPA');
      }
    }
  } catch (e) {
    console.error("error Generating ipa", e)
    resetElements(`Error Generating Ipa: ${e}`)
  }
})
document.querySelectorAll('input').forEach(function(input) {
  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      input.blur();
      input.reportValidity()
    }
  });
});
window.formatVersionInput = function() {
  const minIOSVersionInput = document.getElementById('min-ios-version');
  let minIOSVersionValue = minIOSVersionInput.value;

  if (/^\d+$/.test(minIOSVersionValue)) {
    minIOSVersionValue = minIOSVersionValue + '.0';
  }

  minIOSVersionInput.value = minIOSVersionValue;
}

/*
const saveAs = (blob, name) => {
  
  const a = document.createElement('a');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.href = 'data:application/ipa;base64' + blob;
  a.download = name; 
  a.rel = 'noopener';
   

  a.click();

  setTimeout(() => a.click(), 0)
  setTimeout(()=> URL.revokeObjectURL(blob), 30 * 60 * 1000)
}
*/