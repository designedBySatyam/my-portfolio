document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial Setup & Theme Persistence
    console.log("Contact page logic loaded!");

    // Apply the saved theme from localStorage immediately
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    // Initialize Lucide Icons for social links
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Staggered Entrance Animation for Social Links
    const socialItems = document.querySelectorAll('.social-item');
    socialItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(10px)";
        
        setTimeout(() => {
            item.style.transition = "all 0.5s ease";
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        }, 400 + (index * 100)); 
    });

    // 3. EmailJS Real Submission Logic
    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector(".submit-btn");
            const originalText = btn.textContent;
            
            // Visual feedback: Sending state
            btn.textContent = "Sending...";
            btn.disabled = true;

            // Prepare the data from your form fields
            // Prepare the data to match your template tags exactly
                const templateParams = {
                    form_name: contactForm.querySelector('input[type="text"]').value, // Changed from from_name
                    reply_to: contactForm.querySelector('input[type="email"]').value, 
                    message: contactForm.querySelector('textarea').value
                };

                // Use your specific IDs
                emailjs.send('service_hvoqys3', 'template_guin48a', templateParams)
                .then(() => {
                    // Success state animation
                    btn.textContent = "Message Sent! ✨";
                    btn.style.background = "#22c55e"; 
                    contactForm.reset();
                    
                    // Revert button state after 3 seconds
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = ""; 
                        btn.disabled = false;
                    }, 3000);
                }, (error) => {
                    // Error state feedback
                    console.log('FAILED...', error);
                    btn.textContent = "Error! ❌";
                    btn.style.background = "#ef4444";
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = "";
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }
});