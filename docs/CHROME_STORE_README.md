# Site Link Explorer - Chrome Web Store Submission Guide

This document contains all the information needed to submit the extension to Chrome Web Store.

## Quick Reference

| Field | Value |
|-------|-------|
| Extension Name | Site Link Explorer |
| Version | 1.0.0 |
| Category | Developer Tools |
| Language | English |
| Price | Free |
| Manifest Version | 3 |

---

## Store Listing Content

### Name
```
Site Link Explorer
```

### Short Description (132 characters)
```
Scan and categorize website links from sitemap.xml, robots.txt, and other public sources. Find hidden pages and APIs instantly.
```

### Description (Full)
```
Site Link Explorer is a powerful developer tool that helps you discover and analyze all publicly accessible links on any website. Perfect for SEO professionals, security researchers, web developers, and digital marketers.

KEY FEATURES:

🔍 Comprehensive Link Discovery
• Automatically scans sitemap.xml files
• Parses robots.txt including disallowed paths
• Discovers hidden pages and endpoints
• Finds API documentation and developer resources

📊 Smart Categorization
Automatically sorts links into 12 categories:
• Conversion pages (checkout, pricing, trials)
• Partner & affiliate programs
• Admin panels and dashboards
• API & documentation endpoints
• User account pages
• Contact & support pages
• Legal & privacy pages
• Blog & content pages
• File resources (PDFs, downloads)
• Service files (sitemap, robots.txt)
• Disallowed paths from robots.txt

✨ Customizable Categories
• Create your own categories with custom icons
• Add custom pattern matching rules
• Rename or hide default categories
• Reorder categories to match your workflow

🎨 User-Friendly Interface
• Clean, modern design with light/dark themes
• Search and filter discovered links
• Collapsible category view
• One-click link copying
• Badge counter showing total links found

📤 Export Capabilities
• Export to CSV format
• Export to JSON with full metadata
• Includes category information
• Save scan history for later reference

🌍 Multi-Language Support
English, Spanish, Russian, German, and French

PRIVACY & SECURITY:
✅ Only scans publicly accessible information
✅ All data stored locally in your browser
✅ No data sent to external servers
✅ No tracking or analytics
✅ Open source and transparent

HOW TO USE:
1. Navigate to any website
2. Click the extension icon
3. Browse categorized links
4. Search for specific URLs
5. Export results if needed

PERMISSIONS EXPLAINED:
• activeTab - To scan the current website
• storage - To save your preferences locally
• tabs - To enable auto-scan feature
• host_permissions - To fetch sitemap and robots.txt files

All permissions are used solely for the extension's core functionality.
```

### Category
```
Developer Tools
```

### Language
```
English
```

---

## Screenshots (1280x800px recommended)

### Screenshot 1: Main Interface
**Caption:** Discover and browse links organized by smart categories

### Screenshot 2: Categorized Links
**Caption:** All links automatically categorized for easy navigation

### Screenshot 3: Custom Categories
**Caption:** Create custom categories with your own pattern matching rules

### Screenshot 4: Dark Theme
**Caption:** Beautiful dark theme for comfortable late-night work

### Screenshot 5: Settings Page
**Caption:** Powerful configuration options and scan history management

---

## Promotional Images

### Small Promotional Tile (440x280px)
Required for Chrome Web Store listing

### Large Promotional Tile (920x680px) - Optional
Shows in featured sections

### Marquee (1400x560px) - Optional
Displayed in Chrome Web Store header

---

## Privacy Policy

**URL:** [Your privacy policy URL]

**Content:**
```
PRIVACY POLICY for Site Link Explorer

Effective Date: January 2025

1. DATA COLLECTION
Site Link Explorer does NOT collect, store, or transmit any personal information or browsing data.

2. LOCAL STORAGE ONLY
- All scan results are stored locally in your browser
- User preferences saved using Chrome's local storage API
- No data is ever uploaded to external servers

3. NO EXTERNAL COMMUNICATION
- The extension does not communicate with any external servers
- No analytics or tracking tools integrated
- Completely offline operation

4. PERMISSIONS
All requested permissions are used exclusively for the extension's functionality:
- activeTab: To scan the website you're viewing
- storage: To save your settings locally
- tabs: To enable auto-scan and badge updates
- host_permissions: To fetch public sitemap and robots.txt files

5. USER CONTROL
- Clear scan history anytime
- Clear cache anytime
- Disable auto-scan feature
- Uninstall removes all local data

6. OPEN SOURCE
The extension's source code is available for review.

For questions, please contact: [Your email]
```

---

## Permissions Justification

### activeTab
**Justification:** Required to read the current page's URL and initiate link discovery when the user clicks the extension icon.

### storage
**Justification:** Required to save user preferences (theme, language, auto-scan settings), custom categories, pattern matching rules, and scan history locally in the browser.

### tabs
**Justification:** Required to detect page loads for the auto-scan feature and to update the badge counter showing the number of discovered links.

### host_permissions (<all_urls>)
**Justification:** Required to fetch sitemap.xml and robots.txt files from any domain the user visits. These are publicly accessible files used for link discovery.

---

## Single Purpose Description

**Single Purpose:** Site Link Explorer's sole purpose is to discover and categorize publicly accessible links from website sitemaps and robots.txt files to help users understand website structure and find specific types of pages.

**How it works:** The extension scans publicly available sitemap.xml and robots.txt files, extracts all URLs, and organizes them into categories based on pattern matching. Users can customize categories and patterns to match their workflow.

---

## Distribution Details

### Visibility
- [x] Public
- [ ] Unlisted (only accessible via direct link)

### Regions
- [x] Available in all countries

### Pricing
- [x] Free
- [ ] Paid

---

## Support Information

### Website
```
[Your website URL]
```

### Email
```
[Your support email]
```

### Privacy Policy URL
```
[Your privacy policy URL]
```

---

## Testing Instructions for Reviewers

Dear Chrome Web Store Reviewer,

Thank you for reviewing Site Link Explorer. Here's how to test the extension:

**BASIC FUNCTIONALITY:**
1. Install the extension
2. Navigate to any website (e.g., https://example.com)
3. Click the extension icon in the toolbar
4. The extension will scan and display discovered links

**TEST SITES:**
- https://www.google.com (has sitemap)
- https://github.com (has robots.txt)
- https://www.wikipedia.org (has both)

**KEY FEATURES TO TEST:**
1. Auto-scan (enable in settings, then visit a new site)
2. Category filtering (click category buttons to filter)
3. Search functionality (type in search box)
4. Export to CSV/JSON (click export buttons)
5. Custom categories (go to settings, create a new category)
6. Theme switching (toggle light/dark in settings)
7. Language switching (change language in settings)

**PERMISSIONS:**
All permissions are used as stated in the justification.

**PRIVACY:**
- No network requests except to fetch sitemap.xml and robots.txt
- All data stored locally using chrome.storage API
- No external servers contacted

If you have any questions, please don't hesitate to contact me at [your email].

---

## Version Information

### Current Version: 1.0.0

**Changes:**
- Initial release
- Comprehensive link discovery from sitemap.xml and robots.txt
- 12 predefined smart categories
- Custom category creation
- Multi-language support (5 languages)
- Light/dark theme support
- CSV/JSON export
- Auto-scan feature
- Scan history management

---

## Submission Checklist

Before submitting to Chrome Web Store:

**Code & Build:**
- [ ] Code is production-ready
- [ ] All console.log statements removed or commented
- [ ] Extension tested in Chrome
- [ ] Build extension with `pnpm build`
- [ ] Test built extension works correctly
- [ ] Zip the `dist` folder for upload

**Store Assets:**
- [ ] Extension icons (16x16, 32x32, 48x48, 128x128)
- [ ] Small promotional tile (440x280px)
- [ ] Screenshots (5 images, 1280x800px)
- [ ] Privacy policy page published
- [ ] Support page/email set up

**Documentation:**
- [ ] README updated with final version
- [ ] CHANGELOG created
- [ ] Privacy policy reviewed
- [ ] Permissions justified

**Testing:**
- [ ] Tested on multiple websites
- [ ] All features working
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Works in incognito mode
- [ ] Settings persist correctly

**Legal:**
- [ ] Privacy policy compliant
- [ ] No copyrighted content
- [ ] Proper licensing
- [ ] Terms of service (if needed)

---

## Post-Submission

### After Approval:
1. Announce on social media
2. Add badge to GitHub README
3. Create demo video
4. Write blog post/article
5. Gather user feedback
6. Monitor reviews
7. Plan next version

### Common Review Delays:
- Missing or incomplete privacy policy
- Insufficient permissions justification
- Misleading descriptions
- Missing screenshots
- Code quality issues

**Average Review Time:** 3-7 business days

---

## Contact

For questions about this submission:
- **Email:** [Your email]
- **GitHub:** [Your GitHub]
- **Website:** [Your website]

---

*Last Updated: January 10, 2025*
*Version: 1.0.0*
