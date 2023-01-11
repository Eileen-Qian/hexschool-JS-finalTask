// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if (menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    } else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}

//-------------------------------
const api_path = "qian14";
const token = "wbZR5O5IEKbv8o0cGmqKdHK5VWm2";
let orderData = [];
const orderList = document.querySelector(".js-orderList");
const init = () => {
    getOrderList();
}
init();

// const renderC3 = () => {
//     // console.log(orderData);
//     //物件資料蒐集
//     let total = {};
//     orderData.forEach((item) => {
//         item.products.forEach((productItem) => {
//           if (total[productItem.category] == undefined){
//               total[productItem.category] = productItem.price * productItem.quantity;
//             }else{
//                 total[productItem.category] += productItem.price * productItem.quantity;
//             }
//         })
//     })
//     // console.log(total);
//     //做出資料關聯
//     let categoryAry = Object.keys(total);
//     // console.log(categoryAry);
//     let newData = [];
//     categoryAry.forEach((item) => {
//         let ary = [];
//         ary.push(item);
//         ary.push(total[item]);
//         newData.push(ary);
//     })
//     // console.log(newData);
//     // C3.js
//     let chart = c3.generate({
//         bindto: '#chart', // HTML 元素綁定
//         data: {
//             type: "pie",
//             columns: newData,
//         },
//     });
// }
const renderC3_Lv2 = () => {
    //資料蒐集
    let obj = {};
    orderData.forEach((item) => {
        item.products.forEach((productItem) => {
            if (obj[productItem.title] === undefined) {
                obj[productItem.title] = productItem.price * productItem.quantity;
            } else {
                obj[productItem.title] += productItem.price * productItem.quantity;
            }
        })
    });
    // console.log(obj);
    //拉出資料關聯
    let originalAry = Object.keys(obj);
    // console.log(originalAry);
    //整理成 C3 要的格式
    let rankSortAry = [];
    originalAry.forEach((item) => {
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });
    console.log(rankSortAry);
    //比大小，降冪排列（取營收前三高的品項作為主要的區塊，其餘的統整加總成一個區塊）
    rankSortAry.sort((a, b) => {
        return b[1] - a[1];
    })

    //如果品項超過 4 筆以上，則統整為其他
    if (rankSortAry.length > 3) {
        let otherTotal = 0;
        rankSortAry.forEach((item, index) => {
            if (index > 2) {
                otherTotal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3, rankSortAry.length - 1);
        rankSortAry.push(["其他", otherTotal]);
    }
    // C3 圖表
    c3.generate({
        bindto: '#chart',
        data: {
            columns: rankSortAry,
            type: 'pie',
        },
        color: {
            pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
        }
    });
}

function getOrderList() {
    axios
        .get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
            headers: {
                'authorization': token,
            }
        })
        .then((response) => {
            orderData = response.data.orders;
            // console.log(orderData);
            let str = "";
            orderData.forEach((item) => {
                //組訂單時間字串
                const timeStamp = new Date(item.createdAt * 1000);
                const createdAt = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
                // console.log(createdAt);

                //組產品字串（訂單有多個產品品項）
                let productStr = "";
                item.products.forEach((productItem) => {
                    productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`;
                })
                //判斷訂單處理狀態
                let orderStatus = "";
                if (item.paid == true) {
                    orderStatus = "已處理";
                } else {
                    orderStatus = "未處理";
                }
                //組訂單字串
                str += `<tr>
                <td>${item.id}</td>
                <td>
                  <p>${item.user.name}</p>
                  <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                  ${productStr}
                </td>
                <td>${createdAt}</td>
                <td class="js-orderStatus">
                  <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
                </td>
                <td>
                  <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                </td>
            </tr>`
            })
            orderList.innerHTML = str;
            renderC3_Lv2();
        })
}

orderList.addEventListener("click", ((e) => {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    // console.log(targetClass);
    let id = e.target.getAttribute("data-id");
    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrderItem(id);
        return;
    }
    if (targetClass == "orderStatus") {
        let status = e.target.getAttribute("data-status");
        // console.log(e.target.getAttribute("data-status"));
        updateOrderStatus(status, id);
        return;
    }
}))

//變更訂單狀態
const updateOrderStatus = (status, id) => {
    console.log(status, id);
    let newStatus;
    if (status === "true") {
        newStatus = false;
    } else {
        newStatus = true;
    }
    axios
        .put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`, {
            "data": {
                "id": id,
                "paid": newStatus
            }
        }, {
            headers: {
                'authorization': token,
            }
        })
        .then((response) => {
            alert("更改狀態成功～");
            getOrderList();
        })
}

//刪除單筆訂單
const deleteOrderItem = (id) => {
    axios
        .delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
            headers: {
                'authorization': token,
            }
        })
        .then((response) => {
            alert("刪除單筆訂單成功～");
            getOrderList();
        })
}

const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", ((e) => {
    e.preventDefault();
    axios
        .delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
            headers: {
                'authorization': token,
            }
        })
        .then((response) => {
            alert("刪除所有訂單成功～");
            getOrderList();
        })
}))

