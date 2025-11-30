# How to Create PWA Icons - Manual Method

You need two icon files for PWA installation: `icon-192.png` and `icon-512.png`

## 🎨 Option 1: Using Online Tools (Easiest)

### Step 1: Prepare Your Logo
- Have your church logo ready (PNG or JPG)
- Preferably square format

### Step 2: Use Online Icon Generator
1. Go to https://realfavicongenerator.net/
2. Upload your logo
3. Generate icons
4. Download the package
5. Extract `android-chrome-192x192.png` and `android-chrome-512x512.png`
6. Rename them to `icon-192.png` and `icon-512.png`
7. Place both in the `/public` folder

**Alternative Tool:** https://www.favicon-generator.org/

---

## 🎨 Option 2: Using Canva (Free & Easy)

### Step 1: Create Design
1. Go to https://www.canva.com
2. Create new design: **512 x 512 pixels** (Custom size)
3. Add your church logo
4. Add text if needed (e.g., "AGCMS")
5. Use navy blue background (#1a237e) to match your theme
6. Save as PNG

### Step 2: Resize for Both Sizes
1. Download the 512x512 design
2. Rename to `icon-512.png`
3. Create another design: **192 x 192 pixels**
4. Use same design (or resize the 512 version)
5. Save as `icon-192.png`

### Step 3: Place Files
- Copy both files to `/public` folder in your project

---

## 🎨 Option 3: Using Photoshop/GIMP

### Step 1: Create 512x512 Icon
1. Open Photoshop/GIMP
2. Create new image: **512 x 512 pixels**
3. Background: Navy blue (#1a237e)
4. Add your church logo
5. Center and resize logo
6. Export as PNG: `icon-512.png`

### Step 2: Create 192x192 Icon
1. Resize the 512 version to 192x192
2. Or create new 192x192 image with same design
3. Export as PNG: `icon-192.png`

### Step 3: Place Files
- Copy both to `/public` folder

---

## 🎨 Option 4: Using the Generate Script (Automated)

### Step 1: Install Dependencies
```bash
npm install sharp --save-dev
```

### Step 2: Prepare Source Image
- Place your logo as `logo.png` or `logo.jpg` in project root

### Step 3: Run Script
```bash
node scripts/generate-icons.js
```

The script will:
- Automatically resize your logo
- Add navy blue background
- Generate both icon sizes
- Place them in `/public` folder

---

## 🎨 Option 5: Simple Text-Based Icon (Quickest)

If you don't have a logo, create simple text icons:

### Using Canva:
1. Create 512x512 design
2. Background: Navy blue (#1a237e)
3. Add text: "AGCMS" (large, white or gold)
4. Center text
5. Save as `icon-512.png`
6. Create 192x192 version
7. Save as `icon-192.png`

### Using Online Tools:
1. Go to https://www.favicon-generator.org/
2. Enter text: "AGCMS"
3. Choose colors: Navy background, white/gold text
4. Generate and download
5. Extract the PNG files

---

## ✅ Verification

After creating icons:

1. **Check file names:**
   - `public/icon-192.png` ✓
   - `public/icon-512.png` ✓

2. **Check file sizes:**
   - icon-192.png should be 192x192 pixels
   - icon-512.png should be 512x512 pixels

3. **Test in browser:**
   - Build your app: `npm run build`
   - Start: `npm start`
   - Open in Chrome
   - Check if install prompt appears
   - Verify icons show correctly

---

## 📝 Quick Checklist

- [ ] Create 512x512 PNG icon
- [ ] Create 192x192 PNG icon
- [ ] Both files named correctly
- [ ] Both files in `/public` folder
- [ ] Files are PNG format
- [ ] Icons look good (not blurry)
- [ ] Test PWA installation

---

## 💡 Design Tips

1. **Use simple, recognizable design**
   - Church logo works best
   - Keep it simple (details get lost at small sizes)

2. **High contrast**
   - Navy blue background (#1a237e)
   - White or gold text/logo

3. **Square format**
   - Icons should be square (same width and height)
   - Don't use rectangular logos directly

4. **Test at small size**
   - Look at 192x192 version - should still be clear
   - If blurry, simplify the design

---

**Once icons are in place, your PWA will be fully functional!** 🎉

