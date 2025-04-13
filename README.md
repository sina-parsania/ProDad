# ProDad - Support Through Parenthood

ProDad is a Progressive Web App (PWA) designed to help fathers support their partners during pregnancy, childbirth, and early parenthood. This application provides tools for tracking appointments, managing reminders, storing important medical documents, and accessing resources to navigate the journey of fatherhood.

## Features

### Dashboard

- At-a-glance view of upcoming events, active reminders, and recent documents
- Quick access to all key features

### Calendar

- Schedule and track medical appointments, classes, and key dates
- Sync with partners to maintain a shared calendar
- Multiple views (day, week, month, agenda)
- Event categorization and details

### Reminders

- Set up reminders for medication, appointments, and other important tasks
- Notification system with browser notifications
- Priority-based organization
- Recurring reminder capabilities

### Document Storage

- Store and organize important medical documents, prescriptions, and photos
- Categorization system for easy retrieval
- Preview capabilities for multiple file types
- Secure local storage

### Ask AI

- Get answers to common parenting questions

### Progressive Web App

- Install on your device for offline use

## PWA Features

This application is a Progressive Web App (PWA), which means you can:

- **Install on your device** - Works on Android, iOS\*, and desktop browsers
- **Use offline** - Core functionality works without an internet connection
- **Receive notifications** - Get reminded about important events
- **Automatic updates** - Always have the latest version

\*Note: iOS has limited PWA capabilities compared to Android and desktop.

## Development

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository

```bash
git clone https://github.com/sina-parsania/ProDad.git
cd prodad
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

### Git Hooks with Husky

ProDad uses Husky to enforce code quality standards through Git hooks:

- **Pre-commit Hook**: Automatically lints and formats staged files using ESLint and Prettier
- **Pre-push Hook**: Runs linting checks before allowing code to be pushed
- **Commit-msg Hook**: Enforces conventional commit message format

These hooks help maintain consistent code quality and prevent issues from being committed or pushed to the repository.

#### Commit Message Convention

ProDad follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This standardizes commit messages and makes the project history more readable and organized.

Commit messages must follow this format:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit
- `wip`: Work in progress

**Examples:**
```
feat: add dashboard widget
fix: correct calendar event timezone display
docs: update installation instructions
chore: update dependencies
```

#### How it works

1. When you commit changes, the pre-commit hook will:
   - Run ESLint on staged .ts, .tsx, .js, and .jsx files
   - Format files with Prettier
   - Only process staged files (using lint-staged)

2. When you push changes, the pre-push hook will:
   - Run linting on the entire codebase
   
3. When you create a commit message, the commit-msg hook will:
   - Validate your commit message against the conventional commit format
   - Reject commits that don't follow the convention

#### Manual setup

If the hooks aren't working, you can reinstall them with:

```bash
npm run prepare
```

### Building for Production

```bash
npm run build
npm run start
```

### Validating PWA Setup

After building the project, you can validate the PWA setup with:

```bash
npm run pwa:validate
```

## PWA Testing

1. **Build and run the production version**:

   ```bash
   npm run build
   npm run start
   ```

2. **Audit with Lighthouse**:

   - Open Chrome DevTools
   - Go to the "Lighthouse" tab
   - Check "Progressive Web App"
   - Click "Generate report"

3. **Test offline functionality**:

   - Open Chrome DevTools
   - Go to the "Network" tab
   - Check "Offline"
   - Refresh the page

4. **Install the PWA**:
   - Look for the install icon in the browser's address bar
   - Alternatively, on Chrome, go to the three-dot menu > "Install ProDad"

## PWA Configuration

The PWA configuration is managed by next-pwa and can be found in:

- `next.config.js` - Service worker and caching configuration
- `public/manifest.json` - App manifest with metadata and icons
- `src/components/pwa/InstallPrompt.tsx` - Custom install prompt
- `src/components/ServiceWorkerRegistration.tsx` - Service worker registration and updates

### PWA Icons

The ProDad application uses a set of standard PWA icons generated from the main logo. The icons are located in the `/public/icons/` directory and are available in the following sizes:

- 48x48
- 72x72
- 96x96
- 144x144
- 192x192
- 512x512

To regenerate the icons (for example, if the logo changes), run:

```bash
npm run icons:generate
```

To verify that all the necessary icons exist and are correctly referenced in the manifest.json:

```bash
npm run icons:test
```

## Browser Support

ProDad works best in modern browsers that support:

- IndexedDB
- Service Workers
- Notifications API

For the full background notification experience, the application should be:

1. Installed as a PWA
2. Given notification permissions
3. Used in a browser that supports Background Sync (primarily Chromium-based browsers)

## Privacy

ProDad stores all data locally on your device. No data is sent to external servers, ensuring your medical information remains private and secure.

## License

[MIT](LICENSE)
