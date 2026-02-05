# Certificates Folder

Place your certificate images here.

## Certificate Files

Add your certificate images with these names (or update the HTML to match your filenames):

1. **aws-certificate.jpg**
   - AWS Cloud Foundations certificate
   
2. **ibm-certificate.jpg**
   - IBM Cloud Computing certificate
   
3. **club-cert.jpg**
   - AWS Cloud Club membership certificate

## Guidelines

- **Format**: JPG or PNG
- **Size**: Keep under 500KB for fast loading
- **Quality**: High enough to be readable when displayed
- **Naming**: Use descriptive, lowercase names with hyphens
- **Privacy**: Ensure you're comfortable sharing these publicly

## To Add New Certificates

1. Add the image file to this folder
2. Update `pages/resume.html`:
   ```html
   <li 
       data-image="../assets/certificates/your-cert.jpg"
       onclick="showCert('../assets/certificates/your-cert.jpg')"
   >
       Certificate Name
   </li>
   ```
