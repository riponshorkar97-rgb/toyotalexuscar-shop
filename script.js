"use strict";

/* =========================================
   TOYOTALEXUSCAR SHOP
   MASTER SCRIPT
   Compatible with current cars.json
========================================= */

let cars = [];

let currentBrand = "all";
let currentCategory = "all";
let currentSearch = "";

let galleryImages = [];
let galleryIndex = 0;


/* =========================================
   ELEMENTS
========================================= */

const allModels = document.getElementById("allModels");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const resultsCount = document.getElementById("resultsCount");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");


/* =========================================
   LOAD DATABASE
========================================= */

async function loadCars() {
    try {
        const response = await fetch("cars.json");

        if (!response.ok) {
            throw new Error("cars.json could not be loaded.");
        }

        const database = await response.json();

        cars = Array.isArray(database.cars)
            ? database.cars
            : [];

        renderCars();

    } catch (error) {
        console.error(error);

        if (allModels) {
            allModels.innerHTML = `
                <div class="no-results">
                    <h3>Database Error</h3>
                    <p>Please check your cars.json file.</p>
                </div>
            `;
        }

        if (resultsCount) {
            resultsCount.textContent = "Database unavailable.";
        }
    }
}


/* =========================================
   FILTER DATABASE
========================================= */

function getFilteredCars() {

    return cars.filter(car => {

        const brandMatch =
            currentBrand === "all" ||
            String(car.brand || "").toLowerCase() ===
            currentBrand.toLowerCase();


        const categoryMatch =
            currentCategory === "all" ||
            String(car.category || "").toLowerCase() ===
            currentCategory.toLowerCase() ||
            String(car.powertrain_type || "").toLowerCase() ===
            currentCategory.toLowerCase();


        const searchable = [

            car.brand,
            car.model,
            car.year,
            car.category,
            car.body_style,
            car.powertrain_type,

            ...(Array.isArray(car.variants)
                ? car.variants
                : []),

            car.specifications?.fuel,
            car.specifications?.engine,
            car.specifications?.transmission,
            car.specifications?.drivetrain,

            car.description

        ]
        .filter(value =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .join(" ")
        .toLowerCase();


        const searchMatch =
            searchable.includes(currentSearch);


        return (
            brandMatch &&
            categoryMatch &&
            searchMatch
        );

    });

}


/* =========================================
   RENDER CARS
========================================= */

function renderCars() {

    if (!allModels) return;

    const filtered = getFilteredCars();

    allModels.innerHTML = "";


    if (resultsCount) {
        resultsCount.textContent =
            `${filtered.length} vehicle${
                filtered.length === 1 ? "" : "s"
            } found`;
    }


    if (!filtered.length) {

        allModels.innerHTML = `
            <div class="no-results">

                <h3>
                    No vehicles found
                </h3>

                <p>
                    Try another search or filter.
                </p>

            </div>
        `;

        return;
    }


    filtered.forEach(car => {

        allModels.appendChild(
            createCarCard(car)
        );

    });

}


/* =========================================
   CREATE CAR CARD
========================================= */

function createCarCard(car) {

    const card =
        document.createElement("article");

    card.className = "model-card";


    const images =
        getCarImages(car);

    const image =
        images[0] || "";


    const carId =
        encodeURIComponent(car.id || "");


    card.innerHTML = `

        <div class="model-image">

            ${
                image

                ? `

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            `${car.brand || ""} ${car.model || ""}`
                        )}"
                        loading="lazy"
                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='flex';
                        "
                    >

                    <div
                        class="no-image"
                        style="display:none;"
                    >
                        Image Unavailable
                    </div>

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
                ${escapeHTML(car.brand || "N/A")}
            </span>


            <h3>
                ${escapeHTML(car.model || "Unknown Model")}
            </h3>


            <p class="model-year">
                ${car.year || "N/A"}
            </p>


            <p class="model-category">
                ${escapeHTML(car.category || "N/A")}
            </p>


            <p class="model-price">
                ${getPrice(car)}
            </p>


            <button
                class="details-btn"
                type="button"
                onclick="showCarDetails('${escapeHTML(car.id || "")}')"
            >
                View Full Details
            </button>

        </div>

    `;


    return card;

}


/* =========================================
   GET IMAGES
========================================= */

function getCarImages(car) {

    const images = [];


    if (car.images?.hero) {

        images.push(
            car.images.hero
        );

    }


    if (
        Array.isArray(car.images?.gallery)
    ) {

        car.images.gallery.forEach(image => {

            if (
                image &&
                !images.includes(image)
            ) {

                images.push(image);

            }

        });

    }


    return images;

}


/* =========================================
   SHOW CAR DETAILS
========================================= */

function showCarDetails(carId) {

    const car =
        cars.find(
            item => item.id === carId
        );


    if (!car) {
        return;
    }


    closeCarDetails();


    galleryImages =
        getCarImages(car);

    galleryIndex = 0;


    const modal =
        document.createElement("div");


    modal.id =
        "carDetailsModal";

    modal.className =
        "car-details-modal";


    modal.innerHTML = `

        <div
            class="details-overlay"
            onclick="closeCarDetails()"
        ></div>


        <div class="details-container">


            <button
                class="details-close"
                onclick="closeCarDetails()"
                aria-label="Close"
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
                                src="${escapeHTML(
                                    galleryImages[0]
                                )}"
                                alt="${escapeHTML(
                                    `${car.brand || ""} ${car.model || ""}`
                                )}"
                                onerror="
                                    this.style.display='none';
                                "
                            >

                            ${
                                galleryImages.length > 1

                                ? `

                                    <button
                                        class="gallery-prev"
                                        onclick="changeGalleryImage(-1)"
                                        aria-label="Previous image"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        class="gallery-next"
                                        onclick="changeGalleryImage(1)"
                                        aria-label="Next image"
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
                                        type="button"
                                        onclick="setGalleryImage(${index})"
                                        aria-label="Image ${index + 1}"
                                    >

                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(
                                                `${car.model || "Car"} image ${index + 1}`
                                            )}"
                                            loading="lazy"
                                        >

                                    </button>

                                `
                            ).join("")}

                        </div>

                    `

                    : ""

                }


                ${createImageCredit(car)}

            </div>


            <!-- DETAILS -->

            <div class="details-content">


                <span class="details-brand">
                    ${escapeHTML(car.brand || "N/A")}
                </span>


                <h2>
                    ${escapeHTML(car.model || "Unknown Model")}
                </h2>


                <p class="details-year">
                    Model Year:
                    ${car.year || "N/A"}
                </p>


                <!-- SPECIFICATIONS -->

                <div class="details-grid">

                    ${detailItem(
                        "Brand",
                        car.brand
                    )}

                    ${detailItem(
                        "Model",
                        car.model
                    )}

                    ${detailItem(
                        "Year",
                        car.year
                    )}

                    ${detailItem(
                        "Category",
                        car.category
                    )}

                    ${detailItem(
                        "Body Style",
                        car.body_style
                    )}

                    ${detailItem(
                        "Powertrain",
                        car.powertrain_type
                    )}

                    ${detailItem(
                        "Fuel",
                        car.specifications?.fuel
                    )}

                    ${detailItem(
                        "Engine",
                        car.specifications?.engine
                    )}

                    ${detailItem(
                        "Transmission",
                        car.specifications?.transmission
                    )}

                    ${detailItem(
                        "Drivetrain",
                        car.specifications?.drivetrain
                    )}

                    ${detailItem(
                        "Seats",
                        car.specifications?.seating
                    )}

                    ${detailItem(
                        "Horsepower",
                        car.specifications?.horsepower_hp
                            ? `${car.specifications.horsepower_hp} hp`
                            : null
                    )}

                    ${detailItem(
                        "Price",
                        getPrice(car)
                    )}

                </div>


                <!-- VARIANTS -->

                ${
                    Array.isArray(car.variants) &&
                    car.variants.length

                    ? `

                        <section class="details-section">

                            <h3>
                                Available Variants
                            </h3>

                            <div class="variant-list">

                                ${car.variants.map(
                                    variant => `
                                        <span class="variant-tag">
                                            ${escapeHTML(variant)}
                                        </span>
                                    `
                                ).join("")}

                            </div>

                        </section>

                    `

                    : ""

                }


                <!-- DESCRIPTION -->

                ${
                    car.description

                    ? `

                        <section class="details-section">

                            <h3>
                                Description
                            </h3>

                            <p>
                                ${escapeHTML(
                                    car.description
                                )}
                            </p>

                        </section>

                    `

                    : ""

                }


                <!-- IMAGE SOURCE -->

                ${createImageCredit(car)}


                <!-- OFFICIAL SOURCE -->

                ${createOfficialSources(car)}

            </div>

        </div>

    `;


    document.body.appendChild(modal);

    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================
   IMAGE CREDIT
========================================= */

function createImageCredit(car) {

    const imageData =
        car.images;


    if (!imageData) {
        return "";
    }


    const source =
        imageData.source || "";

    const license =
        imageData.license || "";

    const commercial =
        imageData.commercial_use;


    if (
        !source &&
        !license
    ) {
        return "";
    }


    return `

        <div
            class="image-credit"
            style="
                margin-top:12px;
                padding:12px;
                border:1px solid #262626;
                border-radius:8px;
                background:#101010;
                color:#777;
                font-size:11px;
                line-height:1.6;
            "
        >

            <strong
                style="color:#aaa;"
            >
                Image Information
            </strong>

            <br>

            ${
                source
                ? `
                    Source:
                    ${escapeHTML(source)}
                    <br>
                  `
                : ""
            }

            ${
                license
                ? `
                    License:
                    ${escapeHTML(license)}
                    <br>
                  `
                : ""
            }

            ${
                typeof commercial === "boolean"
                ? `
                    Commercial Use:
                    ${commercial ? "Yes" : "No"}
                  `
                : ""
            }

        </div>

    `;

}


/* =========================================
   OFFICIAL SOURCES
========================================= */

function createOfficialSources(car) {

    const url =
        car.official_source;


    if (!url) {
        return "";
    }


    let hostname = "";

    try {
        hostname =
            new URL(url).hostname;
    } catch (error) {
        hostname = "";
    }


    return `

        <section class="details-section">

            <h3>
                Official / Data Source
            </h3>


            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                "
            >

                <a
                    href="${escapeHTML(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        color:#d7b85a;
                        font-size:13px;
                    "
                >

                    ${
                        escapeHTML(
                            hostname || "Official Source"
                        )
                    }

                    ↗

                </a>

            </div>

        </section>

    `;

}


/* =========================================
   GALLERY NEXT / PREVIOUS
========================================= */

function changeGalleryImage(direction) {

    if (!galleryImages.length) {
        return;
    }


    galleryIndex += direction;


    if (galleryIndex < 0) {

        galleryIndex =
            galleryImages.length - 1;

    }


    if (
        galleryIndex >=
        galleryImages.length
    ) {

        galleryIndex = 0;

    }


    updateGalleryImage();

}


function setGalleryImage(index) {

    if (
        index < 0 ||
        index >= galleryImages.length
    ) {
        return;
    }


    galleryIndex = index;

    updateGalleryImage();

}


function updateGalleryImage() {

    const image =
        document.getElementById(
            "galleryMainImage"
        );


    if (!image) {
        return;
    }


    image.src =
        galleryImages[
            galleryIndex
        ];

}


/* =========================================
   PRICE
========================================= */

function getPrice(car) {

    const price =
        car.price;


    if (!price) {
        return "Price pending verification";
    }


    const amount =
        price.starting_msrp;


    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {

        return "Price pending verification";

    }


    const currency =
        price.currency ||
        "USD";


    const formatted =
        Number(amount).toLocaleString(
            "en-US"
        );


    return `${currency} ${formatted}`;

}


/* =========================================
   DETAIL ITEM
========================================= */

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


/* =========================================
   BRAND FILTER
========================================= */

document
    .querySelectorAll(".brand-filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".brand-filter"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentBrand =
                    button.dataset.brand ||
                    "all";


                renderCars();

            }
        );

    });


/* =========================================
   CATEGORY FILTER
========================================= */

document
    .querySelectorAll(
        ".category-filter"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".category-filter"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentCategory =
                    button.dataset.category ||
                    "all";


                renderCars();

            }
        );

    });


/* =========================================
   SEARCH
========================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            currentSearch =
                searchInput.value
                    .trim()
                    .toLowerCase();


            renderCars();

        }
    );

}


/* =========================================
   CLEAR SEARCH
========================================= */

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }

            currentSearch = "";

            renderCars();

        }
    );

}


/* =========================================
   MOBILE MENU
========================================= */

if (mobileMenuBtn && mobileNav) {

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            mobileNav.classList.toggle(
                "open"
            );

        }
    );

}


document
    .querySelectorAll(
        ".mobile-nav a"
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                if (mobileNav) {
                    mobileNav.classList.remove(
                        "open"
                    );
                }

            }
        );

    });


/* =========================================
   KEYBOARD CONTROLS
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

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


/* =========================================
   CLOSE DETAILS
========================================= */

function closeCarDetails() {

    const modal =
        document.getElementById(
            "carDetailsModal"
        );


    if (modal) {
        modal.remove();
    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================
   START WEBSITE
========================================= */

loadCars();
