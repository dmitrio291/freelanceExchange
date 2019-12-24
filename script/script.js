document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const customer = document.getElementById('customer'),
        freelancer = document.getElementById('freelancer'),
        blockCustomer = document.getElementById('block-customer'),
        blockFreelancer = document.getElementById('block-freelancer'),
        blockChoice = document.getElementById('block-choice'),
        btnExit = document.getElementById('btn-exit'),
        formCustomer = document.getElementById('form-customer'),
        ordersTable = document.getElementById('orders'),
        modalOrder = document.getElementById('order_read'),
        modalOrderActive = document.getElementById('order_active'),
        headTable = document.getElementById('headTable');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    const toStorage = () => {
        localStorage.setItem('orders', JSON.stringify(orders));
    };

    //эта ф-ия принимает 2 параметра число и массив с 3-мя аргументами
    // есть условие число при остатке от деления на 100 больше чем 4 и это число меньше 20.
    // если эти условия выполняются выдается число 2(2-ой элемент в массиве, который мы передали), 
    // в противное случае у нас будет выбран какой-то элемент массива и то число, которое передали при остатке от деления на 10 меньше 5
    // если да, то вычисляется остаток от деления на 10, если нет то возвращается 5(5-ый элемент массива)
    const declOfNum = (number, titles) => number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ?
        2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];

    const calcDeadline = (date) => {
        const deadline = new Date(date); // получаем текущую дату дедлайна в удобном формате в виде объекта
        const toDay = Date.now(); // получаем текущую дату в миллиссекундах, кол-во миллисекунд от 1 января 1970 г.

        // (deadline - toDay) - кол-во миллисекунд от текущего момента когда мы нажали кнопку до дедлайна
        // 1000 - получаем кол-во секунд сколько осталось до дедлайна
        // 60 - получаем кол-во секунд до дедлайна
        // 60 - получаем кол-во часов до дедлайна
        const remaining = (deadline - toDay) / 1000 / 60 / 60; // из текущих миллисекунд вычисляем секунды, минуты, часы

        if (remaining / 24 > 2) {
            return declOfNum(Math.floor(remaining / 24), ['день', 'дня', 'дней']);
        }

        return declOfNum(Math.floor(remaining), ['час', 'часа', 'часов']);        
    };

    const renderOrders = () => {

        ordersTable.textContent = '';

        orders.map((order, i) => {

            ordersTable.innerHTML += `
            <tr class="order ${order.active ? 'taken' : ''}" 
                data-number-order="${i}">
                <td>${i + 1}</td>
                <td>${order.title}</td>
                <td class="${order.currency}"></td>
                <td>${calcDeadline(order.deadline)}</td>
            </tr>`;

        });
    };

    const handlerModal = (event) => {
        const target = event.target;
        const modal = target.closest('.order-modal');
        const order = orders[modal.id];

        const baseAction = () => {
            modal.style.display = 'none';
            toStorage();
            renderOrders();
        };

        if (target.closest('.close') || target === modal) {
            modal.style.display = 'none';
        }

        if (target.classList.contains('get-order')) {
            order.active = true;
            baseAction();
        }

        if (target.id === 'capitulation') {
            order.active = false;
            baseAction();
        }

        if (target.id === 'ready') {
            orders.splice(orders.indexOf(order), 1);
            baseAction();
        }

    };

    const openModal = (numberOrder) => {
        const order = orders[numberOrder];

        const { title, firstName, email, phone, description, amount,
            currency, deadline, active = false } = order;

        const modal = active ? modalOrderActive : modalOrder;

        const firstNameBlock = modal.querySelector('.firstName'),
            titleBlock = modal.querySelector('.modal-title'),
            emailBlock = modal.querySelector('.email'),
            descriptionBlock = modal.querySelector('.description'),
            deadlineBlock = modal.querySelector('.deadline'),
            currencyBlock = modal.querySelector('.currency_img'),
            countBlock = modal.querySelector('.count'),
            phoneBlock = modal.querySelector('.phone');

        modal.id = numberOrder;
        titleBlock.textContent = title;
        firstNameBlock.textContent = firstName;
        emailBlock.textContent = email;
        emailBlock.href = 'mailto:' + email;
        descriptionBlock.textContent = description;
        deadlineBlock.textContent = calcDeadline(deadline);
        currencyBlock.className = 'currency_img';
        currencyBlock.classList.add(currency);
        countBlock.textContent = amount;
        phoneBlock && (phoneBlock.href = 'tel:' + phone);

        modal.style.display = 'flex';

        modal.addEventListener('click', handlerModal);
    };

    const sortOrder = (arr, property) => {
        arr.sort((a, b) => a[property] > b[property] ? 1 : -1);
    };

    headTable.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('head-sort')) {
            if (target.id === 'taskSort') {
                sortOrder(orders, 'title');
            }

            if (target.id === 'currencySort') {
                sortOrder(orders, 'currency');
            }

            if (target.id === 'deadlineSort') {
                sortOrder(orders, 'deadline');
            }
            toStorage();
            renderOrders();
        }
    });

    ordersTable.addEventListener('click', (event) => {
        const target = event.target;

        const targetOrder = target.closest('.order');

        if (targetOrder) {
            openModal(targetOrder.dataset.numberOrder);
        }
    });

    customer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        // substring() - берет номер элемента в строке или массиве от него до конца вырезает и возвращает, то что он вырезал он возвращает нам
        const toDay = new Date().toISOString().substring(0, 10); // получаем текущую дату через -
        document.getElementById('deadline').min = toDay;
        blockCustomer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    freelancer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        renderOrders();
        blockFreelancer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    btnExit.addEventListener('click', () => {
        btnExit.style.display = 'none';
        blockFreelancer.style.display = 'none';
        blockCustomer.style.display = 'none';
        blockChoice.style.display = 'block';
    });

    formCustomer.addEventListener('submit', (event) => {
        event.preventDefault();

        const obj = {};

        // Преобразуем html колекцию в массив с помощью глобального объекта Array и его метода from 
        // Array.from(formCustomer.elements).forEach((elem) => {
        //     if ((elem.tagName === 'INPUT' && elem.type !== 'radio') ||
        //         (elem.type === 'radio' && elem.checked) ||
        //         elem.tagName === 'TEXTAREA') {
        //         obj[elem.name] = elem.value;

        //         if (elem.type !== 'radio') {
        //             elem.value = '';
        //         }
        //     }
        // });

        // Преобразуем html колекцию в массив с помощью spread оператора, который разбиваем массив на единичные элементы через запятую
        // [...formCustomer.elements].forEach((elem) => {
        //     if ((elem.tagName === 'INPUT' && elem.type !== 'radio') ||
        //         (elem.type === 'radio' && elem.checked) ||
        //         elem.tagName === 'TEXTAREA') {
        //         obj[elem.name] = elem.value;

        //         if (elem.type !== 'radio') {
        //             elem.value = '';
        //         }
        //     }
        // });

        // Перебираем элементы массива с помощью цикла for of
        // for (const elem of formCustomer.elements) {
        //     if ((elem.tagName === 'INPUT' && elem.type !== 'radio') ||
        //         (elem.type === 'radio' && elem.checked) ||
        //         elem.tagName === 'TEXTAREA') {
        //         obj[elem.name] = elem.value;

        //         if (elem.type !== 'radio') {
        //             elem.value = '';
        //         }
        //     }
        // }

        const elements = [...formCustomer.elements]
            .filter((elem) => (elem.tagName === 'INPUT' && elem.type !== 'radio') ||
                (elem.type === 'radio' && elem.checked) ||
                elem.tagName === 'TEXTAREA');

        elements.map((elem) => {
            obj[elem.name] = elem.value;
        });

        // Перебор элементов массива с помощью метода forEach
        // elements.forEach((elem) => {
        //     obj[elem.name] = elem.value;
        // });

        formCustomer.reset();

        orders.push(obj);
        toStorage();

    });

});