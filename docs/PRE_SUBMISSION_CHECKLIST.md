# Chrome Web Store Pre-Submission Checklist

This checklist will help ensure your extension is ready for submission to the Chrome Web Store.

## ✅ Completed Items

- [x] Extension manifest.json configured with proper name and description
- [x] All 5 language translations updated (English, Spanish, Russian, German, French)
- [x] Default locale set to English
- [x] Extension description matches Chrome Web Store short description (132 chars)
- [x] Store listing document prepared (STORE_LISTING.md)
- [x] Submission guide created (CHROME_STORE_README.md)
- [x] Privacy policy template prepared
- [x] Permissions justification documented
- [x] Single purpose statement defined
- [x] Testing instructions for reviewers prepared

## 🔨 To-Do Before Submission

### 1. Extension Icons
- [ ] Create 16x16px icon (toolbar)
- [ ] Create 32x32px icon (Windows)
- [ ] Create 48x48px icon (extension management)
- [ ] Create 128x128px icon (Chrome Web Store)
- [ ] Replace placeholder `icons/icon.svg` in manifest.json with PNG versions

**Current Status:** manifest.json uses `icons/icon.svg` - need to create proper PNG icons

**Action Required:**
```bash
# Create icons directory if needed
mkdir -p public/icons

# Create PNG icons (16x16, 32x32, 48x48, 128x128)
# Update manifest.json to reference PNG files
```

### 2. Screenshots (Required: Minimum 1, Recommended: 5)
- [ ] Screenshot 1: Main popup interface (1280x800px)
- [ ] Screenshot 2: Category management (1280x800px)
- [ ] Screenshot 3: Light & dark themes (1280x800px)
- [ ] Screenshot 4: Export options (1280x800px)
- [ ] Screenshot 5: Settings page (1280x800px)

**Tips for Screenshots:**
- Use 1280x800px or 640x400px dimensions
- Show the extension in action
- Highlight key features
- Use clean, uncluttered browser environment
- Include captions (see STORE_LISTING.md for suggested captions)

### 3. Promotional Images
- [ ] Small promotional tile: 440x280px (REQUIRED)
- [ ] Large promotional tile: 920x680px (Optional - for featured sections)
- [ ] Marquee: 1400x560px (Optional - for store header)

**Note:** Only the small tile is required for initial submission.

### 4. Privacy Policy
- [ ] Create a dedicated privacy policy page
- [ ] Host it on a public URL (GitHub Pages, your website, etc.)
- [ ] Update STORE_LISTING.md with the actual URL
- [ ] Update CHROME_STORE_README.md with the actual URL

**Template:** See CHROME_STORE_README.md lines 145-185 for full privacy policy text

**Hosting Options:**
- GitHub Pages: Create `PRIVACY_POLICY.md` in repo, enable GitHub Pages
- Personal website
- Gist: https://gist.github.com/

### 5. Support Information
- [ ] Set up support email address
- [ ] Create support website or GitHub Issues page
- [ ] Update STORE_LISTING.md with actual contact information
- [ ] Update CHROME_STORE_README.md with actual contact information

**Current Placeholders to Replace:**
- `[Your Name/Company]`
- `[Your website URL]`
- `[Your support email]`
- `[Privacy policy page URL]`
- `[Your email]`
- `[Your GitHub]`

### 6. Code Quality & Testing
- [ ] Remove all `console.log()` statements (or use conditional logging)
- [ ] Test extension on multiple websites:
  - [ ] https://www.google.com (has sitemap)
  - [ ] https://github.com (has robots.txt)
  - [ ] https://www.wikipedia.org (has both)
  - [ ] Test site with no sitemap/robots.txt
- [ ] Test all features:
  - [ ] Auto-scan toggle
  - [ ] Category filtering
  - [ ] Search functionality
  - [ ] Export to CSV
  - [ ] Export to JSON
  - [ ] Custom category creation
  - [ ] Pattern management
  - [ ] Theme switching
  - [ ] Language switching (all 5 languages)
  - [ ] Category reordering
  - [ ] Category rename/hide/delete
- [ ] Test in incognito mode
- [ ] Test with no internet connection (should handle gracefully)
- [ ] Verify no console errors
- [ ] Check performance (scan speed should be acceptable)
- [ ] Verify settings persist after browser restart

### 7. Build for Production
- [ ] Run production build:
  ```bash
  pnpm build
  ```
- [ ] Test the built extension (load from `dist` folder)
- [ ] Verify all features work in production build
- [ ] Check bundle size (should be < 500 KB)
- [ ] Create ZIP file from `dist` folder:
  ```bash
  cd dist
  zip -r ../site-link-explorer-v1.0.0.zip .
  cd ..
  ```

### 8. Chrome Developer Dashboard Setup
- [ ] Create Chrome Web Store Developer account
- [ ] Pay one-time $5 developer registration fee
- [ ] Verify your email address
- [ ] Set up 2-factor authentication (recommended)

### 9. Legal & Compliance
- [ ] Review privacy policy for accuracy
- [ ] Ensure no copyrighted content in extension
- [ ] Verify open source license (if applicable)
- [ ] Confirm compliance with Chrome Web Store policies
- [ ] Read Chrome Web Store Developer Program Policies:
  https://developer.chrome.com/docs/webstore/program-policies/

### 10. Final Review
- [ ] All placeholder text replaced with actual information
- [ ] Extension name is unique and searchable
- [ ] Description is accurate and compelling
- [ ] Keywords are relevant and optimized
- [ ] Screenshots show key features clearly
- [ ] Privacy policy is complete and accessible
- [ ] All permissions are justified
- [ ] Extension follows single-purpose policy
- [ ] No misleading claims or functionality

## 📋 Submission Process

### Step 1: Upload Extension
1. Go to Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload your ZIP file
4. Fill in store listing information (use CHROME_STORE_README.md)

### Step 2: Store Listing
Copy content from CHROME_STORE_README.md:
- Extension name (line 22)
- Short description (lines 26-28)
- Full description (lines 31-99)
- Category (line 103)
- Language (line 108)

### Step 3: Upload Assets
- Upload all 5 screenshots with captions
- Upload small promotional tile (440x280px)
- Upload extension icons (already in ZIP)

### Step 4: Privacy & Permissions
- Add privacy policy URL
- Justify each permission (see lines 191-202 in CHROME_STORE_README.md)
- Confirm single purpose (see line 207)

### Step 5: Distribution
- Select visibility: Public
- Select regions: All countries
- Confirm pricing: Free

### Step 6: Submit for Review
- Review all information
- Click "Submit for Review"
- Wait 3-7 business days for approval

## 🚨 Common Rejection Reasons (Avoid These!)

1. **Missing or incomplete privacy policy** - Make sure it's hosted and accessible
2. **Insufficient permissions justification** - Explain each permission clearly
3. **Misleading description** - Be accurate about what the extension does
4. **Missing screenshots** - Provide at least 1, recommended 5
5. **Low-quality icons** - Use proper resolution PNG files
6. **Code quality issues** - Remove console.logs, test thoroughly
7. **Policy violations** - Read and follow all Chrome Web Store policies
8. **Broken functionality** - Test everything before submitting

## 📊 Post-Submission

### After Approval:
- [ ] Add Chrome Web Store badge to GitHub README
- [ ] Announce on social media
- [ ] Share with relevant communities
- [ ] Monitor user reviews
- [ ] Respond to user feedback
- [ ] Plan next version based on feedback

### Marketing Ideas:
- Create demo video (30-60 seconds)
- Write blog post about the extension
- Post on Product Hunt
- Share on Reddit (r/chrome, r/chrome_extensions)
- Share on Hacker News
- Post on LinkedIn/Twitter
- Create tutorial/how-to guide

## 🔗 Useful Links

- **Chrome Web Store Developer Dashboard:**
  https://chrome.google.com/webstore/devconsole

- **Chrome Extension Documentation:**
  https://developer.chrome.com/docs/extensions/

- **Chrome Web Store Policies:**
  https://developer.chrome.com/docs/webstore/program-policies/

- **Extension Best Practices:**
  https://developer.chrome.com/docs/extensions/mv3/quality_guidelines/

- **Icon Guidelines:**
  https://developer.chrome.com/docs/webstore/images/

## 📞 Need Help?

- Review CHROME_STORE_README.md for detailed submission guide
- Review STORE_LISTING.md for complete store listing content
- Check Chrome Extension documentation
- Contact Chrome Web Store support if needed

---

**Last Updated:** January 30, 2025
**Extension Version:** 1.0.0
**Manifest Version:** 3
