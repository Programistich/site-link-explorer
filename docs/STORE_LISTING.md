# Chrome Web Store Listing - Site Link Explorer

## Basic Information

### Extension Name
**Site Link Explorer**

### Short Description (132 characters max)
Scan and categorize website links from sitemap.xml, robots.txt, and other public sources. Find hidden pages and APIs instantly.

### Category
**Developer Tools**

### Language
English (with support for Spanish, Russian, German, and French)

---

## Detailed Description

**Site Link Explorer** is a powerful developer tool that helps you discover and analyze all publicly accessible links on any website. Perfect for SEO professionals, security researchers, web developers, and digital marketers.

### Key Features

🔍 **Comprehensive Link Discovery**
- Automatically scans sitemap.xml files
- Parses robots.txt including disallowed paths
- Discovers hidden pages and endpoints
- Finds API documentation and developer resources

📊 **Smart Categorization**
- Automatically sorts links into 12 predefined categories
- Conversion pages (checkout, pricing, trials)
- Partner & affiliate programs
- Admin panels and dashboards
- API & documentation endpoints
- User account pages
- Contact & support pages
- Legal & privacy pages
- Blog & content pages
- File resources (PDFs, downloads)
- Service files (sitemap, robots.txt)
- Disallowed paths from robots.txt

✨ **Customizable Categories**
- Create your own categories with custom icons
- Add custom pattern matching rules
- Rename or hide default categories
- Reorder categories to match your workflow
- Show/hide default patterns per category

🎨 **User-Friendly Interface**
- Clean, modern design with light/dark themes
- Search and filter discovered links
- Collapsible category view for compact display
- Drag-to-scroll in collapsed mode
- One-click link copying
- Badge counter showing total links found

📤 **Export Capabilities**
- Export all links to CSV format
- Export to JSON with full metadata
- Includes category information
- Save scan history for later reference

🌍 **Multi-Language Support**
- English (default)
- Spanish (Español)
- Russian (Русский)
- German (Deutsch)
- French (Français)

### Use Cases

**For SEO Professionals:**
- Quickly audit website structure
- Discover all indexed pages
- Find orphaned or hidden content
- Analyze competitor site architecture

**For Security Researchers:**
- Identify exposed admin panels
- Find sensitive endpoints
- Discover API documentation
- Locate configuration files

**For Web Developers:**
- Map out website structure
- Find API endpoints for integration
- Locate documentation and guides
- Audit sitemap coverage

**For Digital Marketers:**
- Find conversion pages and pricing
- Locate partner program information
- Discover content opportunities
- Identify lead generation pages

### Privacy & Security

Site Link Explorer respects your privacy:
- ✅ Only scans publicly accessible information
- ✅ All data stored locally in your browser
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Open source and transparent

### How to Use

1. **Navigate** to any website you want to explore
2. **Click** the extension icon to start scanning
3. **Browse** categorized links in the popup
4. **Search** for specific URLs using the search bar
5. **Export** results to CSV or JSON if needed
6. **Customize** categories and patterns in settings

### Auto-Scan Feature

Enable auto-scan in settings to automatically analyze every website you visit. The extension icon badge will show the total number of links discovered.

### Permissions Explained

This extension requires the following permissions:

- **activeTab**: To scan the current tab you're viewing
- **storage**: To save your preferences and scan history locally
- **tabs**: To detect when you navigate to new pages
- **host_permissions (<all_urls>)**: To fetch sitemap.xml and robots.txt files from any domain

All permissions are used solely for the extension's core functionality. No data is collected or transmitted.

---

## Keywords (Tags)

sitemap, robots.txt, seo, web scraping, link discovery, developer tools, api discovery, security research, web development, site audit, link analysis, endpoint discovery, sitemap scanner, robots parser, url finder, website explorer, page discovery

---

## Screenshots Descriptions

### Screenshot 1: Main Popup Interface
**Title:** Discover and Browse Links by Category
**Description:** Clean interface showing all discovered links organized into smart categories. Search, filter, and copy links with one click.

### Screenshot 2: Category Management
**Title:** Customize Categories and Patterns
**Description:** Create custom categories, add your own pattern matching rules, and organize them to match your workflow.

### Screenshot 3: Light & Dark Themes
**Title:** Beautiful UI in Light and Dark Modes
**Description:** Choose between light and dark themes, or let the extension match your system preferences automatically.

### Screenshot 4: Export Options
**Title:** Export Your Discoveries
**Description:** Save scan results to CSV or JSON format for further analysis or documentation.

### Screenshot 5: Settings Page
**Title:** Powerful Configuration Options
**Description:** Configure auto-scan, language preferences, theme, and manage scan history with full control over the extension's behavior.

---

## Permissions Justification

### activeTab Permission
**Why needed:** To read the current page's URL and initiate link discovery on the active tab.
**What it does:** Allows the extension to know which website to scan when you click the extension icon.
**Privacy impact:** Only accesses the active tab, no background tab monitoring.

### storage Permission
**Why needed:** To save your custom categories, preferences, and scan history.
**What it does:** Stores data locally in your browser using Chrome's storage API.
**Privacy impact:** All data stays on your device, never transmitted externally.

### tabs Permission
**Why needed:** To enable auto-scan feature and update the badge counter.
**What it does:** Detects page loads to trigger automatic scans if enabled.
**Privacy impact:** Only monitors page load status, not page content.

### Host Permissions (<all_urls>)
**Why needed:** To fetch sitemap.xml and robots.txt files from any domain.
**What it does:** Makes HTTP requests to download public sitemap and robots files.
**Privacy impact:** Only requests publicly accessible files, no access to private data.

---

## Privacy Policy

**Effective Date:** January 2025

### Data Collection
Site Link Explorer does **NOT** collect, store, or transmit any personal information or browsing data.

### Local Storage Only
- All scan results are stored locally in your browser
- User preferences saved using Chrome's local storage API
- Custom categories and patterns stored on your device
- Scan history maintained locally, never uploaded

### No External Servers
- The extension does not communicate with any external servers
- No analytics or tracking tools integrated
- No advertisements or third-party services
- Completely offline operation

### Permissions Usage
All requested permissions are used exclusively for the extension's core functionality:
- **activeTab**: To scan the website you're currently viewing
- **storage**: To save your settings locally
- **tabs**: To enable auto-scan and badge updates
- **host_permissions**: To fetch public sitemap and robots.txt files

### Open Source
The extension's source code is transparent and available for review, ensuring no hidden data collection or privacy concerns.

### User Control
- You control all data through the settings page
- Clear scan history anytime
- Clear cache anytime
- Disable auto-scan feature
- Uninstall removes all local data

### Contact
For privacy concerns or questions, please open an issue on the project's GitHub repository.

---

## Support & Feedback

### Documentation
Full documentation available at: [Link to documentation]

### Bug Reports
Please report issues on GitHub: [Link to issues page]

### Feature Requests
We welcome feature suggestions on GitHub: [Link to discussions]

### Contact
For general inquiries: [Contact email]

---

## Version History

### Version 1.0.0 (Initial Release)
- ✅ Comprehensive link discovery from sitemap.xml and robots.txt
- ✅ 12 predefined smart categories
- ✅ Custom category creation with pattern matching
- ✅ Multi-language support (5 languages)
- ✅ Light/dark theme support
- ✅ CSV/JSON export functionality
- ✅ Search and filter capabilities
- ✅ Auto-scan feature
- ✅ Scan history management
- ✅ Badge counter display
- ✅ Drag-to-scroll interface
- ✅ Category customization (rename, hide, reorder)
- ✅ Pattern management (add, remove, hide defaults)

---

## Technical Details

### Built With
- Vue 3 (Composition API)
- Pinia (State Management)
- Vite (Build Tool)
- @crxjs/vite-plugin (Chrome Extension Support)

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Opera 74+
- Brave (Chromium-based)

### Manifest Version
Manifest V3 (Latest Chrome Extension standard)

### File Size
< 500 KB (Lightweight and fast)

---

## Promotional Copy

**Short Tagline:**
Discover hidden website links instantly

**Promotional Tile Text (67 chars max):**
Find hidden pages, APIs & endpoints on any site

**Marketing Headline:**
Unlock the Full Structure of Any Website in Seconds

**Call to Action:**
Install now and start discovering hidden links on every website you visit!

---

## Developer Information

### Developer Name
[Your Name/Company]

### Developer Website
[Your website URL]

### Support Email
[Your support email]

### Privacy Policy URL
[Privacy policy page URL]

---

## Additional Store Assets Required

### Extension Icons
- ✅ 16x16px icon (toolbar)
- ✅ 32x32px icon (Windows)
- ✅ 48x48px icon (extension management)
- ✅ 128x128px icon (Chrome Web Store)

### Promotional Images
- **Small Tile:** 440x280px (required)
- **Large Tile:** 920x680px (optional)
- **Marquee:** 1400x560px (optional)
- **Screenshots:** 1280x800px or 640x400px (5 images minimum)

### Video (Optional)
- YouTube promotional video
- Demonstrates key features
- 30-60 seconds length

---

## SEO Optimization

### Primary Keywords
sitemap scanner, robots.txt parser, link discovery tool, website explorer

### Secondary Keywords
seo audit tool, api finder, endpoint discovery, web scraping, site structure analysis

### Target Audience
- Web Developers
- SEO Specialists
- Security Researchers
- Digital Marketers
- Content Strategists

---

## Post-Launch Checklist

- [ ] Submit to Chrome Web Store
- [ ] Create promotional video
- [ ] Set up support channels
- [ ] Monitor user reviews
- [ ] Collect feedback
- [ ] Plan feature updates
- [ ] Create user documentation
- [ ] Set up GitHub repository
- [ ] Add badges to README
- [ ] Announce on social media

---

## Pricing

**Free** - No in-app purchases, completely free forever

---

## Notes for Chrome Web Store Review

This extension:
- ✅ Does NOT inject ads
- ✅ Does NOT modify webpage content
- ✅ Does NOT collect user data
- ✅ Uses permissions only for stated functionality
- ✅ Follows Chrome extension best practices
- ✅ Uses Manifest V3 (latest standard)
- ✅ Has clear privacy policy
- ✅ Provides value to users
- ✅ Professional UI/UX design
- ✅ Well-documented functionality

### Single Purpose Statement
Site Link Explorer's single purpose is to **discover and categorize publicly accessible links from website sitemaps and robots.txt files** to help users understand website structure and find specific types of pages.

---

*This listing was prepared on January 10, 2025*
*Extension Version: 1.0.0*
*Manifest Version: 3*
