const deleteProduct = btn => {
  const prodId = btn.parentNode.querySelector("[name=productId").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf").value;
  const productCard = btn.closest("article.product-item");

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf
    }
  })
    .then(result => {
      //   console.log(result);///
      return result.json();
    })
    .then(data => {
      console.log(data); ///
      // productCard.remove() wouldn't work on IE
      productCard.parentNode.removeChild(productCard);
    })
    .catch(err => {
      console.log(err);
    });
};
