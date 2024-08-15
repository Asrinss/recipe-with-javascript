// HTML elementlerini seçiyoruz
const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

// Event listeners (Olay dinleyicileri)
searchBtn.addEventListener('click', searchByName); // Arama butonuna tıklandığında `searchByName` fonksiyonu çalışır.
mealList.addEventListener('click', getMealRecipe); // Yemek listesinde bir yemeğe tıklandığında `getMealRecipe` fonksiyonu çalışır.
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe'); // Tarif modalını kapatır.
});

// Girdiyle eşleşen yemek listesini alır
function searchByName() {
    let searchInputTxt = document.getElementById('search-input').value.trim(); // Arama kutusundaki metni alır.
    if (searchInputTxt === "") {
        fetchRandomMeals(); // Eğer arama kutusu boşsa rastgele yemek tarifleri getirir.
    } else {
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInputTxt}`)
        .then(response => response.json()) // API'den gelen veriyi JSON formatında alır.
        .then(data => {
            let html = "";
            if (data.meals) { // Eğer yemekler bulunduysa
                data.meals.forEach(meal => { // Her bir yemek için HTML kodu oluşturur
                    html += `
                        <div class="meal-item" data-id="${meal.idMeal}">
                            <div class="meal-img">
                                <img src="${meal.strMealThumb}" alt="food">
                            </div>
                            <div class="meal-name">
                                <h3>${meal.strMeal}</h3>
                                <a href="#" class="recipe-btn">Get Recipe</a>
                            </div>
                        </div>
                    `;
                });
                mealList.classList.remove('notFound'); // Eğer yemek bulunduysa `notFound` sınıfını kaldırır.
            } else {
                html = "Sorry, we didn't find any meal!"; // Eğer yemek bulunamazsa mesaj gösterir.
                mealList.classList.add('notFound');
            }
            mealList.innerHTML = html; // Oluşturulan HTML'i yemek listesine ekler.
        });
    }
}

// Rastgele yemek tarifleri getirir
function fetchRandomMeals() {
    let html = "";
    for (let i = 0; i < 18; i++) {  // 18 rastgele yemek için döngü başlatır
        fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(response => response.json())
        .then(data => {
            data.meals.forEach(meal => { // Her bir rastgele yemek için HTML kodu oluşturur
                html += `
                    <div class="meal-item" data-id="${meal.idMeal}">
                        <div class="meal-img">
                            <img src="${meal.strMealThumb}" alt="food">
                        </div>
                        <div class="meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href="#" class="recipe-btn">Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.innerHTML = html; // Oluşturulan HTML'i yemek listesine ekler.
        });
    }
    mealList.classList.remove('notFound'); // Rastgele yemek bulunduğu için `notFound` sınıfını kaldırır.
}

// Yemek tarifini alır
function getMealRecipe(e) {
    e.preventDefault(); // Varsayılan olay davranışını engeller.
    if (e.target.classList.contains('recipe-btn')) { // Eğer tıklanan element `recipe-btn` sınıfını içeriyorsa
        let mealItem = e.target.parentElement.parentElement; // Yemeğin bulunduğu öğeyi alır.
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals)); // API'den gelen yemek tarifini modalda göstermek için `mealRecipeModal` fonksiyonuna gönderir.
    }
}

// Yemek tarifi ve malzemelerle modal oluşturur
function mealRecipeModal(meal) {
    meal = meal[0]; // İlk öğeyi seçer çünkü API'den gelen veri bir dizi içerisinde gelir.
    let ingredients = [];

    // Malzemeleri ve ölçüleri toplar
    for (let i = 1; i <= 20; i++) {
        let ingredient = meal[`strIngredient${i}`];
        let measure = meal[`strMeasure${i}`];
        if (ingredient) { // Eğer malzeme varsa
            ingredients.push({ ingredient, measure }); // Malzeme ve ölçüyü diziye ekler.
        } else {
            break; // Eğer malzeme yoksa döngüyü kırar.
        }
    }

    // Malzemeler için HTML oluşturur
    let ingredientsHtml = ingredients.map(item => `
        <div class="ingredient-item">
            <img src="https://www.themealdb.com/images/ingredients/${item.ingredient}-Small.png" alt="${item.ingredient}">
            <p>${item.ingredient} - ${item.measure}</p>
        </div>
    `).join('');

    // Tarif detayları için HTML oluşturur
    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
        <div class="recipe-ingredients">
            <h3>Ingredients:</h3>
            ${ingredientsHtml} 
        </div>
    `;
    mealDetailsContent.innerHTML = html; // Oluşturulan HTML'i modal içerisine ekler.
    mealDetailsContent.parentElement.classList.add('showRecipe'); // Modalı göstermek için `showRecipe` sınıfını ekler.
}

// Yemek kategorilerini alır
function getCategories() {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then(response => response.json())
    .then(data => {
        let html = "";
        data.categories.forEach(category => { // Her bir kategori için HTML kodu oluşturur
            html += `
                <div class="category-item">
                    <h3>${category.strCategory}</h3>
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
                </div>
            `;
        });
        document.getElementById('categories').innerHTML = html; // Oluşturulan HTML'i kategoriler bölümüne ekler.
    });
}

// Sayfa yüklendiğinde kategorileri başlatır
window.addEventListener('load', getCategories); // Sayfa yüklendiğinde `getCategories` fonksiyonunu çalıştırır.
