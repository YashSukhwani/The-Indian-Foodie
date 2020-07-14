const foodList = document.querySelector('#foodList');

function renderFood(doc) {
    let li = document.createElement('li');

    let drink = document.createElement('span');
    let starter = document.createElement('span');
    let main = document.createElement('span');
    let removeItem = document.createElement('div');

    li.setAttribute('data-id', doc.id);
    removeItem.classList.add('delete');

    drink.textContent = doc.data().Drink;
    starter.textContent = doc.data().Starter;
    main.textContent = doc.data().Main;

    removeItem.textContent = 'X';

    li.appendChild(starter);
    li.appendChild(main);
    li.appendChild(drink);
    li.appendChild(removeItem);

    foodList.appendChild(li);

    removeItem.addEventListener('click', e => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('Foodie').doc(id).delete();
    })
}

db.collection('Foodie').get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
        console.log(doc.data());
        renderFood(doc);
    });
});

// Real-Time Listener
db.collection('Foodie').orderBy('Main').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        console.log(change.doc.data());
        if (change.type == 'added') {
            renderFood(change.doc);
        } else if (change.type == 'removed') {
            let li = foodList.querySelector('[data-id=' + change.doc.id + ']');
            foodList.removeChild(li);
        }
    });
});

const form = document.querySelector('form');
form.addEventListener('submit', e => {
    e.preventDefault();

    if (!(form.starter.value == "" && form.main.value == "" && form.drink.value == ""))
        db.collection('Foodie').add({
            Starter: form.starter.value,
            Main: form.main.value,
            Drink: form.drink.value
        });
    form.starter.value = "";
    form.main.value = "";
    form.drink.value = "";
})