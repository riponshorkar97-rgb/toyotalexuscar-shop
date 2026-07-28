"use strict";

const featuredModels = document.getElementById("featuredModels");
const allModels = document.getElementById("allModels");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

let cars = [];
let currentBrand = "all";
let currentCategory = "all";


/* ===============================
   LOAD MASTER DATABASE
================================ */

async function loadCars() {
    try {
        const response = await fetch("cars.json");

        if (!response.ok) {
            throw new Error("cars.json could not be loaded");
        }

        const database = await response.json();

        cars = Array.isArray(database.cars)
            ? database.cars
            : [];

        renderFeatured();
        renderCars(cars);

    } catch (error) {

        console.error(error);

        if (allModels) {
            allModels.innerHTML = `
                <div class="database-error">
                    <h3>Database Error</h3>
                    <p>
                        Please check that cars.json is
                        in the same folder as index.html.
                    </p>
                </div>
            `;
        }
    }
}


/* ===============================
   FEATURED
================================ */

function renderFeatured() {

    if (!featuredModels) return;

    featuredModels.innerHTML = "";

    cars.slice(0, 6).forEach(car => {
        featuredModels.appendChild(createCarCard(car));
    });
}


/* ===============================
   CAR CARD
================================ */

function createCarCard(car) {

    const card = document.createElement("article");

    card.className = "model-card";

    const image = car.images?.hero || "";

    const price = getPrice(car);

    card.innerHTML = `

        <div class="model-image">

            ${
                image
                ? `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}"
                        loading="lazy"
                    >
                `
                : `
                    <div class="no-image">
                        Image Coming Soon
                    </div>
                `
            }

        </div>


        <div class="model-info">

            <span class="model-brand">
                ${escapeHTML(car.brand)}
            </span>

            <h3>
                ${escapeHTML(car.model)}
            </h3>

            <p class="model-year">
                ${car.model_year || "Year unavailable"}
            </p>

            <p class="model-category">
                ${escapeHTML(car.category || "N/A")}
            </p>

            <p class="model-price">
                ${price}
            </p>

            <button
                class="details-btn"
                type="button"
                onclick="showCarDetails('${escapeHTML(car.id)}')"
            >
                View Details
            </button>

        </div>

    `;

    return card;
}


/* ===============================
   PRICE
================================ */

function getPrice(car) {

    if (!Array.isArray(car.price) || car.price.length === 0) {
        return "Price unavailable";
    }

    const item = car.price[0];

    if (
        item.amount === null ||
        item.amount === undefined
    ) {
        return "Price unavailable";
    }

    return `${item.currency} ${Number(item.amount).toLocaleString("en-US")}`;
}


/* ===============================
   SEARCH + FILTER
================================ */

function filterCars() {

    const searchTerm =
        searchInput?.value
        ?.trim()
        .toLowerCase() || "";


    const filtered = cars.filter(car => {

        const brandMatch =
            currentBrand === "all" ||
            car.brand.toLowerCase() ===
            currentBrand.toLowerCase();


        const categoryMatch =
            currentCategory === "all" ||
            car.category.toLowerCase() ===
            currentCategory.toLowerCase();


        const searchable = [

            car.brand,
            car.model,
            car.model_year,
            car.category,
            car.body_style,
            car.generation?.name,
            car.generation?.code,
            car.powertrain?.fuel_type,
            car.powertrain?.electrification

        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


        return (
            brandMatch &&
            categoryMatch &&
            searchable.includes(searchTerm)
        );
    });


    renderCars(filtered);
}


/* ===============================
   RENDER ALL CARS
================================ */

function renderCars(data) {

    if (!allModels) return;

    allModels.innerHTML = "";

    if (data.length === 0) {

        allModels.innerHTML = `
            <div class="no-results">
                <h3>No cars found</h3>
                <p>Try another search or filter.</p>
            </div>
        `;

        return;
    }


    data.forEach(car => {

        allModels.appendChild(
            createCarCard(car)
        );

    });
}


/* ===============================
   CAR DETAILS MODAL
================================ */

function showCarDetails(carId) {

    const car = cars.find(
        item => item.id === carId
    );

    if (!car) return;


    const oldModal =
        document.getElementById("carDetailsModal");

    if (oldModal) {
        oldModal.remove();
    }


    const image = car.images?.hero || "";

    const engine =
        car.powertrain?.engine || {};


    const transmission =
        car.powertrain?.transmission || {};


    const modal =
        document.createElement("div");


    modal.id = "carDetailsModal";

    modal.className = "car-details-modal";


    modal.innerHTML = `

        <div class="details-overlay"
             onclick="closeCarDetails()">
        </div>


        <div class="details-container">

            <button
                class="details-close"
                onclick="closeCarDetails()"
                aria-label="Close"
            >
                ×
            </button>


            <div class="details-image">

                ${
                    image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}"
                        >
                    `
                    : `
                        <div class="no-image">
                            Image Coming Soon
                        </div>
                    `
                }

            </div>


            <div class="details-content">

                <span class="details-brand">
                    ${escapeHTML(car.brand)}
                </span>


                <h2>
                    ${escapeHTML(car.model)}
                </h2>


                <p class="details-year">
                    Model Year: ${car.model_year}
                </p>


                <div class="details-grid">

                    ${detailItem(
                        "Category",
                        car.category
                    )}

                    ${detailItem(
                        "Body Style",
                        car.body_style
                    )}

                    ${detailItem(
                        "Generation",
                        car.generation?.name
                    )}

                    ${detailItem(
                        "Generation Code",
                        car.generation?.code
                    )}

                    ${detailItem(
                        "Production",
                        formatProduction(car)
                    )}

                    ${detailItem(
                        "Fuel",
                        car.powertrain?.fuel_type
                    )}

                    ${detailItem(
                        "Powertrain",
                        car.powertrain?.electrification
                    )}

                    ${detailItem(
                        "Engine",
                        engine.type
                    )}

                    ${detailItem(
                        "Displacement",
                        engine.displacement_l
                        ? `${engine.displacement_l} L`
                        : null
                    )}

                    ${detailItem(
                        "Cylinders",
                        engine.cylinders
                    )}

                    ${detailItem(
                        "Horsepower",
                        car.powertrain?.horsepower_hp
                        ? `${car.powertrain.horsepower_hp} hp`
                        : null
                    )}

                    ${detailItem(
                        "Torque",
                        car.powertrain?.torque_nm
                        ? `${car.powertrain.torque_nm} Nm`
                        : null
                    )}

                    ${detailItem(
                        "Transmission",
                        transmission.type
                    )}

                    ${detailItem(
                        "Drivetrain",
                        car.powertrain?.drivetrain
                    )}

                    ${detailItem(
                        "Seating",
                        car.capacity?.seating
                    )}

                    ${detailItem(
                        "Price",
                        getPrice(car)
                    )}

                </div>


                <div class="details-description">

                    <h3>Description</h3>

                    <p>
                        ${escapeHTML(
                            car.description ||
                            "No description available."
                        )}
                    </p>

                </div>


                <div class="details-history">

                    <h3>History</h3>

                    <p>
                        ${escapeHTML(
                            car.history ||
                            "History information unavailable."
                        )}
                    </p>

                </div>


                <div class="details-source">

                    <h3>Source</h3>

                    ${
                        car.official_sources?.length
                        ? car.official_sources.map(source => `
                            <a
                                href="${escapeHTML(source.url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escapeHTML(source.name)}
                            </a>
                        `).join("")
                        : "<p>Source unavailable.</p>"
                    }

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(modal);

    document.body.classList.add(
        "details-open"
    );
}


/* ===============================
   CLOSE DETAILS
================================ */

function closeCarDetails() {

    const modal =
        document.getElementById("carDetailsModal");

    if (modal) {
        modal.remove();
    }

    document.body.classList.remove(
        "details-open"
    );
}


/* ===============================
   DETAIL ITEM
================================ */

function detailItem(label, value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }


    return `

        <div class="detail-item">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(value)}
            </strong>

        </div>

    `;
}


/* ===============================
   PRODUCTION
================================ */

function formatProduction(car) {

    const start =
        car.production?.start_year;

    const end =
        car.production?.end_year;


    if (!start) {
        return "Unavailable";
    }

    return end
        ? `${start}–${end}`
        : `${start}–Present`;
}


/* ===============================
   SEARCH
================================ */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterCars
    );

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        filterCars
    );

}


/* ===============================
   ESCAPE KEY
================================ */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeCarDetails();
        }

    }
);


/* ===============================
   HTML ESCAPE
================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ===============================
   START
================================ */

loadCars();
