`
Web App to store and retrieve files using a time-bounded URL ⏳
`

The files you upload are **end-to-end encrypted**.

`
The files you upload are put into a zip file and then encrypted using a hash-key which is then attached to the URL given to you. So, we can't see what you've uploaded even though we have them.
When downloading, your encrypted zip-file is downloaded and decrypted with the hash-key that came with the URL.
`

**Local-Storage** is used to have quick access to your previous unexpired downloads.

### Encryption

<img src="https://i.ibb.co/N6KPBsK/Enc.png" />

### Decryption

<img src="https://i.ibb.co/0jgXNsz/Dec.png" />

### Core Modules
- express
- React
- @blueprintJS/core
- @blueprintjs/icons
- react-router-dom
- aws-sdk
