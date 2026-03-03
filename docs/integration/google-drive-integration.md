# Google Drive Integration Strategy

Trivexa integrates with Google Drive to store and manage project files, contracts, and deliverables.

## 1. Authentication (OAuth2)
We use the **Google Drive API v3**.

- **Scopes**: `https://www.googleapis.com/auth/drive.file` (Recommended: App only accesses files it creates).
- **Service Account**: Used for server-side operations (creating folders automatically).
- **User Auth**: Used if we need to access a client's personal drive (less common).

## 2. Folder Structure
We maintain a structured hierarchy in a "Root Trivexa Folder".

```text
/Trivexa Root
  /Clients
    /[Client Name]
      /Contracts
      /Invoices
      /Projects
        /[Project Name]
          /Assets
          /Deliverables
```

### 2.1 Automation
- **New Client**: System creates `Clients/[Client Name]` folder.
- **New Project**: System creates `Projects/[Project Name]` and subfolders.

## 3. File Management

### 3.1 uploading
Files uploaded via Trivexa UI are streamed directly to Google Drive (passthrough).
We do not store large files on our server.

### 3.2 Linking
We store the **File ID** and **WebViewLink** in our database `files` table.

```typescript
interface DriveFile {
  id: string;          // '1AB2c...'
  name: string;        // 'contract.pdf'
  mimeType: string;    // 'application/pdf'
  webViewLink: string; // 'https://drive.google.com/...'
}
```

## 4. Permissions

- **Internal Team**: Has `Editor` access to the Root Folder.
- **Clients**: Can be given `Viewer` access to specific `Deliverables` folders via their Google Email.

## 5. Webhooks (Changes)
We use **Push Notifications** to sync changes (e.g., if a file is renamed in Drive) back to Trivexa.
