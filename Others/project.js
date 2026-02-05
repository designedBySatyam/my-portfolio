function openModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    modal.style.display = "flex";
    modalImg.src = imgSrc;
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}