# IPA-editor

**What are IPAs?**
IPA are application packages for ios apps just like android has apk as their application package.you can sideload (install) IPAs via sidestore, altstore, scarlet etc
## Features
- **Basic Mode**:
  - **Edit Name**: Change the display name of the app (CFBundleDisplayName).
  - **Edit Bundle Name**: Change the bundle name of the app (CFBundleName). 
  - **Edit Icon**: Modify the app's icon. (coming very soon)
  - **Edit Version**: Update the app's version (CFBundleVersion and CFBundleShortVersionString).
  - **Edit Identifier**: Change the app's bundle identifier (CFBundleIdentifier).
  - **Edit Minimum iOS Version**: Set the minimum required iOS version (MinimumOSVersion).
  - **Supports Files App**: Toggle to determine whether the app appears in the iOS system Files app.
- **Advanced Mode** (Coming Soon):
  - **Edit Any Key**: Modify any key in the `Info.plist` file.
  - **Add New Keys**: Add new keys to the `Info.plist` file.
  - **Delete Keys**: Remove existing keys from the `Info.plist` file.

## Getting Started

### Prerequisites
- A somewhat modern web browser with JavaScript enabled.

### Usage
1. Visit the [IPA Editor website](https://omax64mxg4ming.github.io/IPA-editor/).
2. **Upload IPA**: Click the "Upload IPA" button and select your IPA file.
3. **Edit Properties**: Once the IPA is uploaded, use the form to edit  properties in Basic Mode

4. **Submit Changes**: After making the desired changes, click the "Submit" button to apply them.


### Contribution
If you want to contribute to the project, follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature or improve design'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

### License
This project is licensed under the MIT License. 
## Acknowledgements
- Thanks to the creators of [JSZip](https://stuk.github.io/jszip/)  [@plist/plist](https://www.npmjs.com/package/@plist/plist) [FileSaver.js](https://github.com/eligrey/FileSaver.js/) for their awesome libraries.


---

Enjoy editing your IPAs with **IPA EDITOR**!
