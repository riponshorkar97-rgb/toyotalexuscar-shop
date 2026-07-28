"use strict";

/* =========================================
   ToyotaLexusCar Shop
   Main JavaScript
========================================= */

const featuredModels = document.getElementById("featuredModels");
const allModels = document.getElementById("allModels");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuClose = document.getElementById("mobileMenuClose");

const filterButtons = document.querySelectorAll(".filter-btn");
const categoryButtons = document.querySelectorAll(".category-card");


let cars = [];
let currentBrandFilter = "all";
let currentCategoryFilter = "all";


/* =========================================
   LOAD DATABASE
========================================= */

async function loadCars() {

    try {

        const response = await fetch("cars.json");

        if (!response.ok) {
            throw new Error("Unable to load cars.json");
        }

        cars = await response.json();

        renderFeaturedModels(cars.slice(0, 6));

        renderAllModels(cars);

    } catch (error) {

        console.error("Database Error:", error);

        showDatabaseError();

    }

}


/* =========================================
   CREATE CAR CARD
========================================= */

function createCarCard(car) {

    const card = document.createElement("article");

    card.className = "model-card";

    const imageHTML = car.image
        ? `
            <img
                src="${escapeHTML(car.image)}"
                alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}"
                loading="lazy"
            >
          `
        : `
            <div>
                Image Coming Soon
            </div>
          `;


    const yearText = car.year_end
        ? `${car.year_start}–${car.year_end}`
        : `${car.year_start}–Present`;


    const priceText = car.price_usd !== null
        ? `Starting price: $${Number(car.price_usd).toLocaleString("en-US")}`
        : "Price: Not available";


    card.innerHTML = `

        <div class="model-image">

            ${imageHTML}

        </div>


        <div class="model-info">

            <div class="model-brand">
                ${escapeHTML(car.brand)}
            </div>


            <h3 class="model-name">
                ${escapeHTML(car.model)}
            </h3>


            <div class="model-meta">

                <span>
                    ${escapeHTML(yearText)}
                </span>

                <span>
                    ${escapeHTML(car.category || "N/A")}
                </span>

                <span>
                    ${escapeHTML(car.fuel || "N/A")}
                </span>

            </div>


            <div class="model-price">
                ${escapeHTML(priceText)}
            </div>

        </div>

    `;


    return card;

}


/* =========================================
   FEATURED MODELS
========================================= */

function renderFeaturedModels(data) {

    if (!featuredModels) return;

    featuredModels.innerHTML = "";

    if (data.length === 0) {

        featuredModels.innerHTML =
            "<p>No featured models found.</p>";

        return;

    }


    data.forEach(car => {

        featuredModels.appendChild(
            createCarCard(car)
        );

    });

}


/* =========================================
   ALL MODELS
========================================= */

function renderAllModels(data) {

    if (!allModels) return;

    allModels.innerHTML = "";

    if (data.length === 0) {

        allModels.innerHTML = `
            <p>
                No models found.
            </p>
        `;

        return;

    }


    data.forEach(car => {

        allModels.appendChild(
            createCarCard(car)
        );

    });

}


/* =========================================
   FILTER DATABASE
========================================= */

function applyFilters() {

    const searchTerm =
        searchInput?.value
            .trim()
            .toLowerCase() || "";


    const filteredCars = cars.filter(car => {

        const brandMatch =
            currentBrandFilter === "all" ||
            car.brand === currentBrandFilter;


        const categoryMatch =
            currentCategoryFilter === "all" ||
            car.category === currentCategoryFilter;


        const searchableText = [

            car.brand,
            car.model,
            car.year_start,
            car.year_end,
            car.category,
            car.fuel,
            car.engine

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        const searchMatch =
            searchableText.includes(searchTerm);


        return (
            brandMatch &&
            categoryMatch &&
            searchMatch
        );

    });


    renderAllModels(filteredCars);

}


/* =========================================
   BRAND FILTER BUTTONS
========================================= */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        currentBrandFilter =
            button.dataset.filter || "all";


        applyFilters();

    });

});


/* =========================================
   CATEGORY FILTER
========================================= */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentCategoryFilter =
            button.dataset.category || "all";


        applyFilters();


        const allModelsSection =
            document.getElementById("all-models");


        if (allModelsSection) {

            allModelsSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});


/* =========================================
   SEARCH
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (searchButton) {

    searchButton.addEventListener("click", () => {

        applyFilters();


        const allModelsSection =
            document.getElementById("all-models");


        if (allModelsSection) {

            allModelsSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


/* =========================================
   MOBILE MENU
========================================= */

function closeMobileMenu() {

    if (!mobileMenu) return;

    mobileMenu.classList.remove("active");

    document.body.classList.remove("menu-open");

}


if (menuToggle) {

    menuToggle.addEventListener("click", () => {

        mobileMenu.classList.add("active");

        document.body.classList.add("menu-open");

    });

}


if (mobileMenuClose) {

    mobileMenuClose.addEventListener(
        "click",
        closeMobileMenu
    );

}


if (mobileMenu) {

    mobileMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });

}


/* =========================================
   DATABASE ERROR
========================================= */

function showDatabaseError() {

    const message = `

        <div style="
            grid-column: 1 / -1;
            padding: 30px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 14px;
            color: #aaa;
        ">

            <strong>
                Database could not be loaded.
            </strong>

            <br><br>

            Please make sure
            <strong>cars.json</strong>
            exists in the same folder as
            <strong>index.html</strong>.

        </div>

    `;


    if (featuredModels) {

        featuredModels.innerHTML = message;

    }


    if (allModels) {

        allModels.innerHTML = message;

    }

}


/* =========================================
   BASIC HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   START APPLICATION
========================================= */

loadCars();
