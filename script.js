"use strict";


/* =========================
   GLOBAL DATA
========================= */

let cars = [];

let currentBrand = "all";

let currentCategory = "all";

let currentSearch = "";

let galleryImages = [];

let galleryIndex = 0;


/* =========================
   ELEMENTS
========================= */

const allModels =
    document.getElementById("allModels");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const resultsCount =
    document.getElementById("resultsCount");

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const mobileNav =
    document.getElementById("mobileNav");


/* =========================
   LOAD JSON
========================= */

async function loadCars() {

    try {

        const response =
            await fetch("cars.json");

        if (!response.ok) {
            throw new Error(
                "cars.json could not be loaded."
            );
        }

        const database =
            await response.json();

        cars =
            Array.isArray(database.cars)
            ? database.cars
            : [];

        renderCars();

    } catch (error) {

        console.error(error);

        allModels.innerHTML = `
            <div class="no-results">

                <h3>
                    Database Error
                </h3>

                <p>
                    Please check your
                    cars.json file.
                </p>

            </div>
        `;

        resultsCount.textContent =
            "Database unavailable.";
    }
}


/* =========================
   FILTER
========================= */

function getFilteredCars() {

    return cars.filter(car => {

        const brandMatch =
            currentBrand === "all" ||
            car.brand === currentBrand;


        const categoryMatch =
            currentCategory === "all" ||
            car.category === currentCategory ||
            car.powertrain?.electrification ===
                currentCategory;


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


        const searchMatch =
            searchable.includes(
                currentSearch
            );


        return (
            brandMatch &&
            categoryMatch &&
            searchMatch
        );

    });

}


/* =========================
   RENDER
========================= */

function renderCars() {

    const filtered =
        getFilteredCars();


    allModels.innerHTML = "";


    resultsCount.textContent =
        `${filtered.length} vehicle${
            filtered.length === 1
            ? ""
            : "s"
        } found`;


    if (!filtered.length) {

        allModels.innerHTML = `

            <div class="no-results">

                <h3>
                    No vehicles found
                </h3>

                <p>
                    Try another search
                    or filter.
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


/* =========================
   CARD
========================= */

function createCarCard(car) {

    const card =
        document.createElement("article");


    card.className =
        "model-card";


    const images =
        getCarImages(car);


    const image =
        images[0] || "";


    card.innerHTML = `

        <div class="model-image">

            ${
                image
                ? `

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            car.brand +
                            " " +
                            car.model
                        )}"
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

                ${escapeHTML(
                    car.category || "N/A"
                )}

            </p>


            <p class="model-price">

                ${getPrice(car)}

            </p>


            <button
                class="details-btn"
                type="button"
                onclick="showCarDetails('${escapeHTML(
                    car.id
                )}')"
            >

                View Full Details

            </button>

        </div>

    `;


    return card;

}


/* =========================
   IMAGE ARRAY
========================= */

function getCarImages(car) {

    const images = [];


    if (car.images?.hero) {

        images.push(
            car.images.hero
        );

    }


    if (
        Array.isArray(
            car.images?.gallery
        )
    ) {

        car.images.gallery.forEach(
            image => {

                if (
                    image &&
                    !images.includes(image)
                ) {

                    images.push(image);

                }

            }
        );

    }


    return images;

}


/* =========================
   DETAILS MODAL
========================= */

function showCarDetails(carId) {

    const car =
        cars.find(
            item =>
                item.id === carId
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
                                            src="${escapeHTML(
                                                image
                                            )}"
                                            alt="Gallery image ${index + 1}"
                                        >

                                    </button>

                                `
                            ).join("")}

                        </div>

                    `
                    : ""
                }

            </div>


            <!-- INFORMATION -->

            <div class="details-content">

                <span class="details-brand">

                    ${escapeHTML(
                        car.brand
                    )}

                </span>


                <h2>

                    ${escapeHTML(
                        car.model
                    )}

                </h2>


                <p class="details-year">

                    Model Year:
                    ${car.model_year || "N/A"}

                </p>


                <div class="details-grid">

                    ${detailItem(
                        "Brand",
                        car.brand
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
                        "Model Year",
                        car.model_year
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
                        car.powertrain?.engine?.type
                    )}

                    ${detailItem(
                        "Displacement",
                        car.powertrain?.engine?.displacement_l
                        ? car.powertrain.engine.displacement_l + " L"
                        : null
                    )}

                    ${detailItem(
                        "Cylinders",
                        car.powertrain?.engine?.cylinders
                    )}

                    ${detailItem(
                        "Horsepower",
                        car.powertrain?.horsepower_hp
                        ? car.powertrain.horsepower_hp + " hp"
                        : null
                    )}

                    ${detailItem(
                        "Torque",
                        car.powertrain?.torque_nm
                        ? car.powertrain.torque_nm + " Nm"
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
                        "Seats",
                        car.capacity?.seating
                    )}

                    ${detailItem(
                        "Price",
                        getPrice(car)
                    )}

                </div>


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


                <section class="details-section">

                    <h3>
                        History
                    </h3>

                    <p>
                        ${escapeHTML(
                            car.history ||
                            "Information unavailable."
                        )}
                    </p>

                </section>


                ${
                    car.official_sources?.length
                    ? `

                        <section class="details-section">

                            <h3>
                                Data Sources
                            </h3>

                            <p>
                                Information is
                                based on the
                                listed source(s).
                            </p>

                        </section>

                    `
                    : ""
                }

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================
   GALLERY
========================= */

function changeGalleryImage(direction) {

    if (!galleryImages.length) return;


    galleryIndex += direction;


    if (
        galleryIndex < 0
    ) {

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

    galleryIndex = index;

    updateGalleryImage();

}


function updateGalleryImage() {

    const image =
        document.getElementById(
            "galleryMainImage"
        );


    if (!image) return;


    image.src =
        galleryImages[
            galleryIndex
        ];

}


/* =========================
   PRICE
========================= */

function getPrice(car) {

    if (
        !Array.isArray(car.price) ||
        !car.price.length
    ) {

        return "Price pending verification";

    }


    const price =
        car.price[0];


    if (
        price.amount === null ||
        price.amount === undefined
    ) {

        return "Price pending verification";

    }


    return `${price.currency} ${
        Number(
            price.amount
        ).toLocaleString("en-US")
    }`;

}


/* =========================
   DETAIL ITEM
========================= */

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


/* =========================
   PRODUCTION
========================= */

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


/* =========================
   BRAND FILTERS
========================= */

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
                    button.dataset.brand;


                renderCars();

            }
        );

    });


/* =========================
   CATEGORY FILTERS
========================= */

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
                    button.dataset.category;


                renderCars();

            }
        );

    });


/* =========================
   SEARCH
========================= */

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


if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            currentSearch = "";

            renderCars();

            searchInput.focus();

        }
    );

}


/* =========================
   MOBILE MENU
========================= */

if (mobileMenuBtn) {

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

                mobileNav.classList.remove(
                    "open"
                );

            }
        );

    });


/* =========================
   KEYBOARD
========================= */

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


/* =========================
   CLOSE MODAL
========================= */

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


/* =========================
   SECURITY
========================= */

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


/* =========================
   START
========================= */

loadCars();
