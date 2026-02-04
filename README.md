# 🚀 Personal Portfolio Website

A modern, responsive portfolio website with glassmorphism design, featuring editable projects, certificate management, and a contact form.

## ✨ Features

### 🏠 Home Page
- **Modern Glassmorphism Design** - Beautiful frosted glass effect with backdrop blur
- **Animated Typewriter Effect** - Dynamic text animation showcasing skills
- **Interactive 3D Tilt Effect** - Mouse-tracking parallax on headings
- **Animated Background Blob** - Smooth gradient blob that follows cursor
- **Dark/Light Mode** - Persistent theme toggle across all pages
- **Responsive Design** - Fully optimized for mobile, tablet, and desktop

### 📁 Projects Page
- **Add/Edit/Delete Projects** - Full CRUD functionality
- **Project Cards** - Beautiful animated cards with icons
- **Tag System** - Organize projects with custom tags
- **Local Storage** - Projects persist across sessions
- **Icon Selection** - 8 professional icons to choose from
- **Default Projects** - Pre-loaded with sample projects

### 📄 Resume Page
- **Certificate Upload** - Upload and manage certificates
- **Certificate Viewer** - Click to preview certificates
- **Download Certificates** - Download any certificate
- **Skills Showcase** - Animated skill tags
- **Education Section** - Display academic background
- **Local Storage** - Certificates persist across sessions

### 📧 Contact Page
- **Contact Form** - Collect messages from visitors
- **Social Links** - GitHub, LinkedIn, and Email
- **Form Validation** - Real-time input validation
- **Success Modal** - Beautiful confirmation on submission
- **Message Storage** - Save messages to local storage

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid & Flexbox
- **Vanilla JavaScript** - No frameworks, pure JS
- **Local Storage API** - Persistent data storage
- **FileReader API** - Image upload for certificates
- **SVG Icons** - Scalable vector graphics

## 📂 Project Structure

```
portfolio/
├── index.html              # Home page
├── pages/
│   ├── projects.html       # Projects showcase
│   ├── resume.html         # Resume & certificates
│   └── contact.html        # Contact form
├── css/
│   ├── style.css          # Global styles
│   ├── projects.css       # Projects page styles
│   ├── resume.css         # Resume page styles
│   └── contact.css        # Contact page styles
├── js/
│   ├── script.js          # Main JavaScript
│   ├── projects.js        # Projects functionality
│   ├── resume.js          # Resume & certificates
│   └── contact.js         # Contact form handling
├── assets/
│   └── profile.jpg        # Profile picture (add your own)
└── README.md
```

## 🚀 Getting Started

### Installation

1. **Clone or download** this repository
2. **Add your profile picture** to `assets/profile.jpg`
3. **Open `index.html`** in your browser

That's it! No build process, no dependencies to install.

### Customization

#### Update Personal Information

**1. Home Page (`index.html`)**
- Change name in the `<h1>` tag
- Update the typewriter messages in `js/script.js`:
  ```javascript
  const textArray = [
      "Your custom message 1",
      "Your custom message 2",
      // Add more messages
  ];
  ```

**2. Resume Page (`pages/resume.html`)**
- Update education details in the HTML
- Modify skills in the skills-tags section
- Add your certificates using the "Add Certificate" button

**3. Contact Page (`pages/contact.html`)**
- Update social media links
- Change email address
- Optionally integrate with EmailJS or another email service

#### Change Colors

Edit the CSS variables in `css/style.css`:
```css
:root {
    --primary: #6366f1;      /* Primary color */
    --secondary: #a855f7;     /* Secondary color */
    --bg-light: #f8fafc;      /* Light background */
    --text-light: #1e293b;    /* Light text */
}
```

## 🎨 Design Features

### Glassmorphism
- Frosted glass effect with `backdrop-filter: blur()`
- Semi-transparent backgrounds
- Subtle borders and shadows

### Animations
- Smooth fade-in on page load
- Hover effects on all interactive elements
- Staggered animations for lists
- Floating animation on profile image

### Responsive Breakpoints
- **Desktop**: > 900px
- **Tablet**: 768px - 900px
- **Mobile**: < 768px

## 💾 Data Storage

All data is stored in the browser's **localStorage**:

### Storage Keys
- `portfolio-theme` - Dark/light mode preference
- `portfolio-projects` - All project data
- `portfolio-certificates` - Certificate images and metadata
- `portfolio-contact-messages` - Contact form submissions

### Clear Data
To reset all data:
```javascript
localStorage.clear();
location.reload();
```

## 🔧 Advanced Customization

### Add Email Integration

Replace the simulated email sending in `js/contact.js` with a real service:

**Using EmailJS:**
```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
    .then(() => {
        openSuccessModal();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
```

### Add More Project Icons

In `js/projects.js`, add to the `iconMap` object:
```javascript
const iconMap = {
    // ... existing icons
    yourIcon: '<svg>...</svg>'
};
```

### Analytics

Add Google Analytics or similar:
```html
<!-- Add to <head> of each page -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_ID"></script>
```

## 🌐 Deployment

### GitHub Pages
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select branch and folder
4. Your site will be live at `https://username.github.io/repo-name`

### Netlify
1. Drag and drop the folder to Netlify
2. Or connect your GitHub repository
3. Deploy with one click

### Vercel
```bash
npm i -g vercel
vercel
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (not supported - uses modern CSS features)

## 🐛 Known Issues

1. **Profile Image**: Add your own `profile.jpg` to `assets/` folder, or it will show a placeholder
2. **Backdrop Filter**: May not work on older browsers (graceful degradation)
3. **Local Storage**: Data clears if user clears browser data

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and customize it for your own use!

## 📧 Contact

Created by **Satyam Pandey**
- GitHub: [@designedBySatyam](https://github.com/designedBySatyam)
- LinkedIn: [Satyam Pandey](https://www.linkedin.com/in/satyampandey27)
- Email: hello.satyam27@gmail.com

---

**Made with ❤️ using Vanilla JavaScript**

*No frameworks, no dependencies, just clean code!*
