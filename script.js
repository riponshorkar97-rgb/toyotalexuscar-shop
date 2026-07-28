"use strict";

const featuredModels = document.getElementById("featuredModels");
const allModels = document.getElementById("allModels");
const searchInput = document.getElementById("searchInput");

let cars = [];
let galleryImages = [];
let galleryIndex = 0;


/* ===============================
   LOAD DATABASE
================================ */

async function loadCars() {
    try {

        const response = await fetch("cars.json");

        if (!response.ok) {
            throw new Error("cars.json not found");
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
                    <p>Please check cars.json.</p>
                </div>
            `;
        }
    }
}


/* ===============================
   CARD
================================ */

function createCarCard(car) {

    const card = document.createElement("article");

    card.className = "model-card";

    const images = getCarImages(car);

    const mainImage = images[0] || "";

    card.innerHTML = `

        <div class="model-image">

            ${
                mainImage
                ? `
                    <img
                        src="${escapeHTML(mainImage)}"
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
                ${car.model_year || "N/A"}
            </p>

            <p class="model-category">
                ${escapeHTML(car.category || "N/A")}
            </p>

            <p class="model-price">
                ${getPrice(car)}
            </p>

            <button
                class="details-btn"
                onclick="showCarDetails('${escapeHTML(car.id)}')"
            >
                View Details
            </button>

        </div>
    `;

    return card;
}


/* ===============================
   GET IMAGES
================================ */

function getCarImages(car) {

    const images = [];

    if (car.images?.hero) {
        images.push(car.images.hero);
    }

    if (Array.isArray(car.images?.gallery)) {

        car.images.gallery.forEach(image => {

            if (image && !images.includes(image)) {
                images.push(image);
            }

        });
    }

    return images;
}


/* ===============================
   DETAILS
================================ */

function showCarDetails(carId) {

    const car = cars.find(
        item => item.id === carId
    );

    if (!car) return;

    closeCarDetails();

    galleryImages = getCarImages(car);

    galleryIndex = 0;

    const modal = document.createElement("div");

    modal.id = "carDetailsModal";

    modal.className = "car-details-modal";

    modal.innerHTML = `

        <div
            class="details-overlay"
            onclick="closeCarDetails()"
        ></div>


        <div class="details-container">

            <button
                class="details-close"
                onclick="closeCarDetails()"
            >
                ×
            </button>


            <!-- GALLERY -->

            <div class="car-gallery">

                <div class="gallery-main">

                    ${
                        galleryImages.length
                        ? `
                            <img
                                id="galleryMainImage"
                                src="${escapeHTML(galleryImages[0])}"
                                alt="${escapeHTML(car.model)}"
                            >

                            ${
                                galleryImages.length > 1
                                ? `
                                    <button
                                        class="gallery-prev"
                                        onclick="changeGalleryImage(-1)"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        class="gallery-next"
                                        onclick="changeGalleryImage(1)"
                                    >
                                        ›
                                    </button>
                                `
                                : ""
                            }

                        `
                        : `
                            <div class="no-image">
                                Image Coming Soon
                            </div>
                        `
                    }

                </div>


                ${
                    galleryImages.length > 1
                    ? `
                        <div class="gallery-thumbnails">

                            ${galleryImages.map(
                                (image, index) => `

                                <button
                                    onclick="setGalleryImage(${index})"
                                >

                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="Gallery ${index + 1}"
                                    >

                                </button>

                            `
                            ).join("")}

                        </div>
                    `
                    : ""
                }

            </div>


            <!-- DETAILS -->

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
                        car.powertrain?.engine?.type
                    )}

                    ${detailItem(
                        "Displacement",
                        car.powertrain?.engine?.displacement_l
                        ? `${car.powertrain.engine.displacement_l} L`
                        : null
                    )}

                    ${detailItem(
                        "Horsepower",
                        car.powertrain?.horsepower_hp
                        ? `${car.powertrain.horsepower_hp} hp`
                        : null
                    )}

                    ${detailItem(
                        "Transmission",
                        car.powertrain?.transmission?.type
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


                <section class="details-section">

                    <h3>Description</h3>

                    <p>
                        ${escapeHTML(
                            car.description ||
                            "No description available."
                        )}
                    </p>

                </section>


                <section class="details-section">

                    <h3>History</h3>

                    <p>
                        ${escapeHTML(
                            car.history ||
                            "No history available."
                        )}
                    </p>

                </section>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    document.body.classList.add("details-open");
}


/* ===============================
   GALLERY NAVIGATION
================================ */

function changeGalleryImage(direction) {

    if (!galleryImages.length) return;

    galleryIndex += direction;

    if (galleryIndex < 0) {
        galleryIndex = galleryImages.length - 1;
    }

    if (galleryIndex >= galleryImages.length) {
        galleryIndex = 0;
    }

    updateGalleryImage();
}


function setGalleryImage(index) {

    galleryIndex = index;

    updateGalleryImage();
}


function updateGalleryImage() {

    const image =
        document.getElementById("galleryMainImage");

    if (!image) return;

    image.src =
        galleryImages[galleryIndex];

}


/* ===============================
   CLOSE MODAL
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
   PRICE
================================ */

function getPrice(car) {

    if (
        !Array.isArray(car.price) ||
        !car.price.length
    ) {
        return "Price unavailable";
    }

    const price = car.price[0];

    if (
        price.amount === null ||
        price.amount === undefined
    ) {
        return "Price unavailable";
    }

    return `${price.currency} ${Number(
        price.amount
    ).toLocaleString("en-US")}`;
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
        return "N/A";
    }

    return end
        ? `${start}–${end}`
        : `${start}–Present`;
}


/* ===============================
   SEARCH
================================ */

function filterCars() {

    const term =
        searchInput?.value
        ?.trim()
        .toLowerCase() || "";

    const filtered = cars.filter(car => {

        const text = [

            car.brand,
            car.model,
            car.model_year,
            car.category,
            car.body_style,
            car.generation?.name

        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

        return text.includes(term);
    });

    renderCars(filtered);
}


/* ===============================
   RENDER
================================ */

function renderCars(data) {

    if (!allModels) return;

    allModels.innerHTML = "";

    if (!data.length) {

        allModels.innerHTML = `
            <div class="no-results">
                <h3>No cars found</h3>
                <p>Try another search.</p>
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


function renderFeatured() {

    if (!featuredModels) return;

    featuredModels.innerHTML = "";

    cars.slice(0, 6).forEach(car => {

        featuredModels.appendChild(
            createCarCard(car)
        );

    });
}


/* ===============================
   ESCAPE HTML
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
   EVENTS
================================ */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterCars
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeCarDetails();
        }

        if (
            event.key === "ArrowLeft" &&
            galleryImages.length
        ) {
            changeGalleryImage(-1);
        }

        if (
            event.key === "ArrowRight" &&
            galleryImages.length
        ) {
            changeGalleryImage(1);
        }

    }
);


/* ===============================
   START
================================ */

loadCars();
