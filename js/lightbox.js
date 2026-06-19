
function openLightbox(e, img) {
  if (e) e.stopPropagation();
  var lb = document.getElementById('proj-lightbox');
  document.getElementById('lightbox-img').src = img.src;
  lb.classList.add('open');
}
function closeLightbox(e) {
  if (e) e.stopPropagation();
  document.getElementById('proj-lightbox').classList.remove('open');
  document.getElementById('lightbox-img').removeAttribute('src');
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});