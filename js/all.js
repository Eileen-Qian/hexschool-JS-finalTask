document.addEventListener("DOMContentLoaded", function () {
    const ele = document.querySelector(".recommendation-wall");
    ele.style.cursor = "grab";
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    const mouseDownHandler = function (e) {
        ele.style.cursor = "grabbing";
        ele.style.userSelect = "none";

        pos = {
            left: ele.scrollLeft,
            top: ele.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY
        };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    };
    const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - pos.x;
        const dy = e.clientY - pos.y;

        // Scroll the element
        ele.scrollTop = pos.top - dy;
        ele.scrollLeft = pos.left - dx;
    };
    const mouseUpHandler = function () {
        ele.style.cursor = "grab";
        ele.style.removeProperty("user-select");

        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
    };
    // Attach the handler
    ele.addEventListener("mousedown", mouseDownHandler);
});
// menu 切換
let menuOpenBtn = document.querySelector(".menuToggle");
let linkBtn = document.querySelectorAll(".topBar-menu a");
let menu = document.querySelector(".topBar-menu");
menuOpenBtn.addEventListener("click", menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener("click", closeMenu);
});

function menuToggle() {
    if (menu.classList.contains("openMenu")) {
        menu.classList.remove("openMenu");
    } else {
        menu.classList.add("openMenu");
    }
}
function closeMenu() {
    menu.classList.remove("openMenu");
}

const api_path = "qian14";
const token = "wbZR5O5IEKbv8o0cGmqKdHK5VWm2";
const productsList = document.querySelector(".productWrap");
const shoppingCartTableList = document.querySelector(".shoppingCart-tableList");
let productData = [];

const productSelect = document.querySelector(".productSelect");

function init() {
    getProductList();
    getCartList();
}
init();

function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then((response) => {
            // console.log(response.data.products);
            productData = response.data.products;
            renderProductList();
        })
}

//組合商品列表 (消除重複)
function combineProductHTMLItem(item) {
    return `<li class="productCard">
      <h4 class="productType">新品</h4>
      <img src="${item.images}" alt="產品圖片">
      <a href="#" id="addCardBtn" class="js-addCart" data-id="${item.id}">加入購物車</a>
      <h3>${item.title}</h3>
      <del class="originPrice">NT$${toThousand(item.origin_price)}</del>
      <p class="nowPrice">NT$${toThousand(item.price)}</p>
      </li>`
}

//渲染商品列表
function renderProductList() {
    let str = "";
    productData.forEach((item) => {
        str += combineProductHTMLItem(item);
    })
    productsList.innerHTML = str;
}

//監聽篩選產品種類
productSelect.addEventListener("change", (e) => {
    // console.log(e.target.value);
    const category = e.target.value;
    if (category == "全部") {
        renderProductList();
        return;
    }
    let str = "";
    productData.forEach((item) => {
        if (item.category == category) {
            str += combineProductHTMLItem(item);
        }
    })
    productsList.innerHTML = str;
})

//監聽 加入購物車
productsList.addEventListener("click", ((e) => {
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if (addCartClass !== "js-addCart") {
        return;
    }
    let productId = e.target.getAttribute("data-id");
    // console.log(productId);
    let numCheck = 1;
    cartsData.forEach((item) => {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1;
        }
    })
    // console.log(numCheck);
    axios
        .post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
            "data": {
                "productId": productId,
                "quantity": numCheck
            }
        }).then((response) => {
            // console.log(response);
            alert("加入購物車成功～");
            getCartList();
        })
}))

//get並渲染購物車資料
let cartsData = [];
function getCartList() {
    axios
        .get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            cartsData = response.data.carts;
            document.querySelector(".js-total").textContent = toThousand(response.data.finalTotal);
            let str = "";
            cartsData.forEach((item) => {
                str += `<tr>
                  <td>
                      <div class="cardItem-title">
                          <img src="${item.product.images}" alt="產品圖片">
                          <p>${item.product.title}</p>
                      </div>
                  </td>
                  <td>NT$${toThousand(item.product.price)}</td>
                  <td>${item.quantity}</td>
                  <td>NT$${toThousand(item.product.price * item.quantity)}</td>
                  <td class="discardBtn">
                      <a href="#" class="material-icons" data-id="${item.id}" data-productTitle="${item.product.title}">clear</a>
                  </td>
              </tr>`;
            })
            shoppingCartTableList.innerHTML = str;
        })
}

//刪除單筆購物車資料
shoppingCartTableList.addEventListener("click", ((e) => {
    e.preventDefault();
    // console.log(e.target);
    const cartId = e.target.getAttribute("data-id");
    const cartPorductTitle = e.target.getAttribute("data-productTitle");
    if (cartId == null) {
        alert("你點到其他東西囉！");
        return;
    }
    // console.log(cartId);
    axios
        .delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then((response) => {
            alert(`刪除 ${cartPorductTitle} 購物車資料成功～`);
            getCartList();
        })
}))

//刪除全部購物車資料
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", ((e) => {
    e.preventDefault();
    axios
        .delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            alert(`刪除所有購物車資料成功～`);
            getCartList();
        })
        .catch((response) => alert("購物車裡面已經沒東西啦～請勿重複點擊"));
}))

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", ((e) => {
    e.preventDefault();
    if (cartsData.length == 0) {
        alert("購物車裡面沒有東西哦～請加點東西進來吧～～");
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const customertradeWay = document.querySelector("#tradeWay").value;
    // console.log(customerName, customerPhone, customerEmail, customerAddress, customertradeWay);
    // if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customertradeWay == "") {
    //     alert("請輸入訂單資訊哦～");
    //     return;
    // }
    // if (validateEmail(customerEmail) == false){
    //     alert("請輸入正確的 Email 格式哦～");
    //     return;
    // }
    axios
        .post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
            "data": {
                "user": {
                    "name": customerName,
                    "tel": customerPhone,
                    "email": customerEmail,
                    "address": customerAddress,
                    "payment": customertradeWay
                }
            }
        })
        .then((response) => {
            alert("訂單建立成功～～");
            document.querySelector("#customerName").value = "";
            document.querySelector("#customerPhone").value = "";
            document.querySelector("#customerEmail").value = "";
            document.querySelector("#customerAddress").value = "";
            document.querySelector("#tradeWay").value = "ATM";
            document.querySelector(`[data-message="Email"]`).textContent = "";
            getCartList();
        })
}))

//驗證 Email
const customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur", ((e) => {
    if (validateEmail(customerEmail.value) == false) {
        // alert("請輸入正確的 Email 格式哦～");
        document.querySelector(`[data-message="Email"]`).textContent = "請填寫正確的 Email 格式哦";
        return;
    }
    document.querySelector(`[data-message="Email"]`).textContent = "";
}))
//驗證 Phone
const customerPhone = document.querySelector("#customerPhone");
customerPhone.addEventListener("blur", ((e) => {
    if (validatePhone(customerPhone.value) == false) {
        document.querySelector(`[data-message="電話"]`).textContent = "請填寫正確的電話格式";
        return;
    }
    document.querySelector(`[data-message="電話"]`).textContent = "";
}))
// 驗證 姓名
const customerName = document.querySelector("#customerName");
customerName.addEventListener("blur", ((e) => {
    if (customerName.value == "") {
        document.querySelector(`[data-message="姓名"]`).textContent = "請輸入姓名";
        return;
    }
    document.querySelector(`[data-message="姓名"]`).textContent = "";
}))
// 驗證 地址
const customerAddress = document.querySelector("#customerAddress");
customerAddress.addEventListener("blur", ((e) => {
    if (customerAddress.value == "") {
        document.querySelector(`[data-message="寄送地址"]`).textContent = "請輸入地址";
        return;
    }
    document.querySelector(`[data-message="寄送地址"]`).textContent = "";
}))

//util js
//將價格改為千分位表示
const toThousand = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

//驗證表單（信箱）
//https://www.w3resource.com/javascript/form/email-validation.php
function validateEmail(customerEmail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(customerEmail)) {
        return true;
    } else {
        return false;
    }

}
//驗證表單（電話）
function validatePhone(customerPhone) {
    if (/^[09]{2}\d{8}$/.test(customerPhone)) {
        return true
    }
    return false;
}