"use strict";

/* =========================================================
   TOYOTALEXUSCAR SHOP
   COMPLETE MASTER SCRIPT
   Image + Search + Brand + Category + Details + Gallery
========================================================= */

let cars = [];

let currentBrand = "all";
let currentCategory = "all";
let currentSearch = "";

let galleryImages = [];
let galleryIndex = 0;


/* =========================================================
   ELEMENTS
========================================================= */

const allModels = document.getElementById("allModels");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const resultsCount = document.getElementById("resultsCount");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");


/* =========================================================
   LOAD DATABASE
========================================================= */

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

                    <p>
                        Please check your cars.json file.
                    </p>

                </div>
            `;

        }

        if (resultsCount) {
            resultsCount.textContent =
                "Database unavailable.";
        }

    }

}


/* =========================================================
   GET POWERTRAIN
========================================================= */

function getPowertrain(car) {

    if (car.powertrain_type) {
        return car.powertrain_type;
    }

    if (car.powertrain?.electrification) {
        return car.powertrain.electrification;
    }

    return "";

}


/* =========================================================
   GET YEAR
========================================================= */

function getYear(car) {

    return (
        car.year ??
        car.model_year ??
        "N/A"
    );

}


/* =========================================================
   GET CATEGORY
========================================================= */

function getCategory(car) {

    return (
        car.category ||
        car.body_style ||
        "N/A"
    );

}


/* =========================================================
   FILTER DATABASE
========================================================= */

function getFilteredCars() {

    return cars.filter(car => {

        const brandMatch =
            currentBrand === "all" ||
            String(car.brand || "").toLowerCase() ===
            String(currentBrand).toLowerCase();


        const powertrain =
            getPowertrain(car);


        const category =
            getCategory(car);


        const categoryMatch =
            currentCategory === "all" ||
            category === currentCategory ||
            powertrain === currentCategory;


        const searchable = [

            car.id,
            car.brand,
            car.model,
            getYear(car),
            category,
            car.body_style,
            powertrain,

            ...(Array.isArray(car.variants)
                ? car.variants
                : []),

            car.generation?.name,
            car.generation?.code,

            car.specifications?.fuel,
            car.specifications?.engine,
            car.specifications?.transmission,
            car.specifications?.drivetrain,

            car.powertrain?.fuel_type,
            car.powertrain?.engine?.type,

            car.description,
            car.history

        ]
        .filter(Boolean)
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


/* =========================================================
   RENDER CARS
========================================================= */

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


/* =========================================================
   IMAGE SETUP
========================================================= */

function getCarImages(car) {

    const images = [];

    const imageData = car.images || {};


    /* HERO IMAGE */

    if (
        typeof imageData.hero === "string" &&
        imageData.hero.trim()
    ) {

        images.push(
            imageData.hero.trim()
        );

    }


    /* GALLERY */

    if (
        Array.isArray(imageData.gallery)
    ) {

        imageData.gallery.forEach(image => {

            if (
                typeof image === "string" &&
                image.trim() &&
                !images.includes(image.trim())
            ) {

                images.push(
                    image.trim()
                );

            }

        });

    }


    return images;

}


/* =========================================================
   IMAGE FALLBACK
========================================================= */

function createImageHTML(car) {

    const images =
        getCarImages(car);

    const image =
        images[0] || "";


    if (!image) {

        return `

            <div class="no-image">

                <div class="no-image-brand">
                    ${escapeHTML(car.brand || "CAR")}
                </div>

                <div>
                    ${escapeHTML(car.model || "Vehicle")}
                </div>

                <small>
                    Image Coming Soon
                </small>

            </div>

        `;

    }


    return `

        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(
                (car.brand || "") +
                " " +
                (car.model || "")
            )}"
            loading="lazy"
            decoding="async"
            onerror="handleImageError(this)"
        >

        <div
            class="no-image"
            style="display:none;"
        >

            <div class="no-image-brand">
                ${escapeHTML(car.brand || "CAR")}
            </div>

            <div>
                ${escapeHTML(car.model || "Vehicle")}
            </div>

            <small>
                Image Unavailable
            </small>

        </div>

    `;

}


/* =========================================================
   IMAGE ERROR HANDLER
========================================================= */

function handleImageError(image) {

    image.style.display = "none";

    const fallback =
        image.nextElementSibling;

    if (fallback) {
        fallback.style.display = "flex";
    }

}


/* =========================================================
   CREATE CAR CARD
========================================================= */

function createCarCard(car) {

    const card =
        document.createElement("article");

    card.className =
        "model-card";


    const price =
        getPrice(car);


    card.innerHTML = `

        <div class="model-image">

            ${createImageHTML(car)}

        </div>


        <div class="model-info">

            <span class="model-brand">
                ${escapeHTML(
                    car.brand || ""
                )}
            </span>


            <h3>
                ${escapeHTML(
                    car.model || "Unknown Model"
                )}
            </h3>


            <p class="model-year">
                ${escapeHTML(
                    getYear(car)
                )}
            </p>


            <p class="model-category">
                ${escapeHTML(
                    getCategory(car)
                )}
            </p>


            <p class="model-price">
                ${escapeHTML(price)}
            </p>


            <button
                class="details-btn"
                type="button"
                onclick="showCarDetails('${escapeHTML(
                    String(car.id || "")
                )}')"
            >

                View Full Details

            </button>

        </div>

    `;


    return card;

}


/* =========================================================
   SHOW DETAILS
========================================================= */

function showCarDetails(carId) {

    const car =
        cars.find(
            item =>
                String(item.id) ===
                String(carId)
        );


    if (!car) return;


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
                                    car.brand +
                                    " " +
                                    car.model
                                )}"
                                onerror="handleImageError(this)"
                            >

                            <div
                                class="no-image"
                                style="display:none;"
                            >

                                Image Unavailable

                            </div>


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

                                <div>
                                    ${escapeHTML(
                                        car.brand || ""
                                    )}
                                </div>

                                <div>
                                    ${escapeHTML(
                                        car.model || ""
                                    )}
                                </div>

                                <small>
                                    Image Coming Soon
                                </small>

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
                                    >

                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(
                                                car.model || ""
                                            )} image ${
                                                index + 1
                                            }"
                                            loading="lazy"
                                            onerror="this.style.display='none';"
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
                    ${escapeHTML(
                        car.brand || ""
                    )}
                </span>


                <h2>
                    ${escapeHTML(
                        car.model || ""
                    )}
                </h2>


                <p class="details-year">

                    Model Year:
                    ${escapeHTML(
                        getYear(car)
                    )}

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
                        getYear(car)
                    )}


                    ${detailItem(
                        "Category",
                        getCategory(car)
                    )}


                    ${detailItem(
                        "Body Style",
                        car.body_style
                    )}


                    ${detailItem(
                        "Powertrain",
                        getPowertrain(car)
                    )}


                    ${detailItem(
                        "Fuel",
                        car.specifications?.fuel ||
                        car.powertrain?.fuel_type
                    )}


                    ${detailItem(
                        "Engine",
                        car.specifications?.engine ||
                        car.powertrain?.engine?.type
                    )}


                    ${detailItem(
                        "Transmission",
                        car.specifications?.transmission ||
                        car.powertrain?.transmission?.type
                    )}


                    ${detailItem(
                        "Drivetrain",
                        car.specifications?.drivetrain ||
                        car.powertrain?.drivetrain
                    )}


                    ${detailItem(
                        "Seats",
                        car.specifications?.seating ||
                        car.capacity?.seating
                    )}


                    ${detailItem(
                        "Horsepower",
                        car.specifications?.horsepower_hp
                            ? car.specifications.horsepower_hp + " hp"
                            : car.powertrain?.horsepower_hp
                                ? car.powertrain.horsepower_hp + " hp"
                                : null
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

                            <p>
                                ${escapeHTML(
                                    car.variants.join(" • ")
                                )}
                            </p>

                        </section>

                    `

                    : ""

                }


                <!-- DESCRIPTION -->

                <section class="details-section">

                    <h3>
                        Description
                    </h3>

                    <p>
                        ${escapeHTML(
                            car.description ||
                            "Information unavailable."
                        )}
                    </p>

                </section>


                <!-- HISTORY -->

                ${
                    car.history

                    ? `

                        <section class="details-section">

                            <h3>
                                History
                            </h3>

                            <p>
                                ${escapeHTML(
                                    car.history
                                )}
                            </p>

                        </section>

                    `

                    : ""

                }


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


/* =========================================================
   IMAGE CREDIT
========================================================= */

function createImageCredit(car) {

    const imageData =
        car.images;


    if (!imageData) {
        return "";
    }


    if (
        !imageData.source &&
        !imageData.image_source &&
        !imageData.license
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
                imageData.source ||
                imageData.image_source

                ? `

                    Source:
                    ${escapeHTML(
                        imageData.source ||
                        imageData.image_source
                    )}

                    <br>

                `

                : ""

            }


            ${
                imageData.license

                ? `

                    License:
                    ${escapeHTML(
                        imageData.license
                    )}

                    <br>

                `

                : ""

            }


            ${
                imageData.commercial_use === false

                ? `

                    Commercial Use:
                    Not confirmed / restricted

                `

                : ""

            }

        </div>

    `;

}


/* =========================================================
   OFFICIAL SOURCES
========================================================= */

function createOfficialSources(car) {

    const sources = [];


    if (
        Array.isArray(
            car.official_sources
        )
    ) {

        car.official_sources.forEach(
            source => {

                if (
                    source &&
                    source.name &&
                    source.url
                ) {

                    sources.push(source);

                }

            }
        );

    }


    if (
        car.official_source
    ) {

        sources.push({

            name:
                car.brand +
                " Official Source",

            url:
                car.official_source

        });

    }


    if (!sources.length) {
        return "";
    }


    const uniqueSources =
        sources.filter(
            (source, index, array) =>

                index ===
                array.findIndex(
                    item =>
                        item.url ===
                        source.url
                )
        );


    return `

        <section class="details-section">

            <h3>
                Official / Data Sources
            </h3>


            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                "
            >

                ${uniqueSources.map(
                    source => `

                        <a
                            href="${escapeHTML(
                                source.url
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                                color:#d7b85a;
                                font-size:13px;
                            "
                        >

                            ${escapeHTML(
                                source.name
                            )}

                            ↗

                        </a>

                    `
                ).join("")}

            </div>

        </section>

    `;

}


/* =========================================================
   GALLERY CONTROL
========================================================= */

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


    galleryIndex =
        index;

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


/* =========================================================
   PRICE
========================================================= */

function getPrice(car) {

    const price =
        car.price;


    /* OLD ARRAY FORMAT */

    if (
        Array.isArray(price)
    ) {

        if (!price.length) {

            return "Price pending verification";

        }

        const item =
            price[0];


        if (
            item.amount === null ||
            item.amount === undefined
        ) {

            return "Price pending verification";

        }


        return formatMoney(
            item.amount,
            item.currency || "USD"
        );

    }


    /* NEW OBJECT FORMAT */

    if (
        price &&
        typeof price === "object"
    ) {

        const amount =
            price.starting_msrp;


        if (
            amount === null ||
            amount === undefined
        ) {

            return "Price pending verification";

        }


        return formatMoney(
            amount,
            price.currency || "USD"
        );

    }


    return "Price pending verification";

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(
    amount,
    currency = "USD"
) {

    const number =
        Number(amount);


    if (!Number.isFinite(number)) {

        return "Price pending verification";

    }


    try {

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: currency
            }
        ).format(number);

    } catch {

        return `${currency} ${
            number.toLocaleString("en-US")
        }`;

    }

}


/* =========================================================
   DETAIL ITEM
========================================================= */

function detailItem(
    label,
    value
) {

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


/* =========================================================
   PRODUCTION
========================================================= */

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


/* =========================================================
   BRAND FILTER
========================================================= */

document
    .querySelectorAll(
        ".brand-filter"
    )
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


/* =========================================================
   CATEGORY FILTER
========================================================= */

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


/* =========================================================
   SEARCH
========================================================= */

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


/* =========================================================
   CLEAR SEARCH
========================================================= */

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            if (searchInput) {

                searchInput.value = "";

            }

            currentSearch = "";

            renderCars();

            if (searchInput) {
                searchInput.focus();
            }

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            if (mobileNav) {

                mobileNav.classList.toggle(
                    "open"
                );

            }

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


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

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


/* =========================================================
   CLOSE DETAILS
========================================================= */

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


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   START
========================================================= */

loadCars();
