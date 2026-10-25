
/* ==================================================
   ALGORITHM VISUALIZER
   Sorting + Searching
================================================== */


/* ==================================================
   1. COMMON FUNCTIONS
================================================== */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function showSection(sectionId, button) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.style.display = "block";
    }

    document.querySelectorAll(".tab-btn").forEach(tab => {
        tab.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".tab-btn").forEach(tab => {
            if (tab.getAttribute("onclick")?.includes(sectionId)) {
                tab.classList.add("active");
            }
        });
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    const button = document.querySelector(".theme-btn");

    if (button) {
        button.textContent = document.body.classList.contains("dark-theme")
            ? "☀️ Toggle Theme"
            : "🌙 Toggle Theme";
    }
}


/* ==================================================
   2. SORTING VISUALIZER VARIABLES
================================================== */

let arr = [];

let sortingRunning = false;
let sortingPaused = false;
let sortingSpeed = 300;

let comparisons = 0;
let swaps = 0;
let sortingRunId = 0;


/* ==================================================
   3. SORTING ARRAY GENERATION
================================================== */

function updateArraySize() {
    const input = document.getElementById("arraySize");

    if (!input) return;

    setText("sizeValue", input.value);
}

function updateSpeed() {
    const input = document.getElementById("speed");

    if (!input) return;

    const speed = Number(input.value);

    sortingSpeed = Math.max(20, 900 - speed * 8);

    setText(
        "speedValue",
        speed >= 75 ? "Fast" : speed <= 25 ? "Slow" : "Medium"
    );
}

function generateArray() {
    if (sortingRunning) return;

    const size = Number(document.getElementById("arraySize").value);

    arr = [];

    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 220) + 30);
    }

    comparisons = 0;
    swaps = 0;

    updateSortingStats();
    renderArray();

    setText("stepText", "Step 0");
    setText("status", "Ready");
    setText("currentAction", "New array generated.");

    updateSortingComplexity();
}


/* ==================================================
   4. SORTING ARRAY DISPLAY
================================================== */

function renderArray(activeIndices = [], sortedIndices = []) {
    const container = document.getElementById("array");

    if (!container) return;

    container.innerHTML = "";

    arr.forEach((value, index) => {
        const bar = document.createElement("div");

        bar.className = "array-bar";
        bar.style.height = value + "px";
        bar.style.flex = "1";
        bar.style.minWidth = "0";
        bar.style.margin = "0 2px";
        bar.style.borderRadius = "4px 4px 0 0";

        if (sortedIndices.includes(index)) {
            bar.style.background = "#35a66f";
        } else if (activeIndices.includes(index)) {
            bar.style.background = "#ff8a8a";
        } else {
            bar.style.background = "#756bd2";
        }

        bar.title = value;

        container.appendChild(bar);
    });
}

function updateSortingStats() {
    setText("comparisons", comparisons);
    setText("swaps", swaps);
}

function updateSortingComplexity() {
    const algorithm = document.getElementById("algorithm")?.value;

    const information = {
        bubble: {
            best: "O(n)",
            average: "O(n²)",
            worst: "O(n²)",
            space: "O(1)",
            explanation: "Bubble Sort repeatedly compares adjacent elements and swaps them when they are in the wrong order."
        },
        selection: {
            best: "O(n²)",
            average: "O(n²)",
            worst: "O(n²)",
            space: "O(1)",
            explanation: "Selection Sort finds the minimum element in the unsorted part and places it at the beginning."
        },
        insertion: {
            best: "O(n)",
            average: "O(n²)",
            worst: "O(n²)",
            space: "O(1)",
            explanation: "Insertion Sort takes each element and inserts it into its correct position in the sorted part."
        },
        quick: {
            best: "O(n log n)",
            average: "O(n log n)",
            worst: "O(n²)",
            space: "O(log n)",
            explanation: "Quick Sort selects a pivot, partitions the array around it, and recursively sorts the partitions."
        },
        merge: {
            best: "O(n log n)",
            average: "O(n log n)",
            worst: "O(n log n)",
            space: "O(n)",
            explanation: "Merge Sort divides the array into smaller parts, sorts them, and merges the sorted parts."
        }
    };

    const info = information[algorithm];

    if (!info) return;

    setText("best", info.best);
    setText("average", info.average);
    setText("worst", info.worst);
    setText("space", info.space);
    setText("explanation", info.explanation);
}


/* ==================================================
   5. SORTING DELAY / PAUSE SUPPORT
================================================== */

function waitForSorting(runId) {
    return new Promise(resolve => {
        const check = () => {
            if (!sortingRunning || runId !== sortingRunId) {
                resolve(false);
                return;
            }

            if (sortingPaused) {
                setTimeout(check, 100);
                return;
            }

            setTimeout(() => {
                resolve(
                    sortingRunning && runId === sortingRunId
                );
            }, sortingSpeed);
        };

        check();
    });
}


/* ==================================================
   6. START SORTING
================================================== */

async function startAlgorithm() {
    if (sortingRunning) return;

    if (arr.length === 0) {
        generateArray();
    }

    sortingRunning = true;
    sortingPaused = false;

    const runId = ++sortingRunId;
    const algorithm = document.getElementById("algorithm").value;

    comparisons = 0;
    swaps = 0;

    updateSortingStats();
    updateSortingComplexity();

    setText("status", "Running");
    setText("stepText", "Step 0");
    setText("currentAction", "Sorting started.");

    try {
        if (algorithm === "bubble") {
            await bubbleSort(runId);
        } else if (algorithm === "selection") {
            await selectionSort(runId);
        } else if (algorithm === "insertion") {
            await insertionSort(runId);
        } else if (algorithm === "quick") {
            await quickSort(runId, 0, arr.length - 1);
        } else if (algorithm === "merge") {
            await mergeSort(runId, 0, arr.length - 1);
        }

        if (sortingRunning && runId === sortingRunId) {
            renderArray([], arr.map((_, index) => index));

            setText("status", "Completed");
            setText("currentAction", "Sorting completed successfully!");
        }
    } finally {
        if (runId === sortingRunId) {
            sortingRunning = false;
            sortingPaused = false;
        }
    }
}


/* ==================================================
   7. BUBBLE SORT
================================================== */

async function bubbleSort(runId) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (!(await waitForSorting(runId))) return;

            comparisons++;

            setText("stepText", "Step " + comparisons);
            setText(
                "currentAction",
                `Comparing ${arr[j]} and ${arr[j + 1]}`
            );

            renderArray([j, j + 1]);

            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
            }

            updateSortingStats();
        }
    }
}


/* ==================================================
   8. SELECTION SORT
================================================== */

async function selectionSort(runId) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < arr.length; j++) {
            if (!(await waitForSorting(runId))) return;

            comparisons++;

            renderArray([minIndex, j]);

            setText(
                "currentAction",
                `Finding the minimum element. Comparing ${arr[minIndex]} and ${arr[j]}.`
            );

            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }

            setText("stepText", "Step " + comparisons);
            updateSortingStats();
        }

        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            swaps++;
        }

        renderArray([i, minIndex]);
        updateSortingStats();
    }
}


/* ==================================================
   9. INSERTION SORT
================================================== */

async function insertionSort(runId) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;

        setText("currentAction", `Inserting element ${key} into its correct position.`);

        while (j >= 0 && arr[j] > key) {
            if (!(await waitForSorting(runId))) return;

            comparisons++;

            arr[j + 1] = arr[j];
            swaps++;

            renderArray([j, j + 1]);
            updateSortingStats();

            setText("stepText", "Step " + comparisons);

            j--;
        }

        arr[j + 1] = key;

        renderArray([j + 1]);
    }
}


/* ==================================================
   10. QUICK SORT
================================================== */

async function quickSort(runId, low, high) {
    if (low >= high) return;

    if (!sortingRunning || runId !== sortingRunId) return;

    const pivotIndex = await partition(runId, low, high);

    if (!sortingRunning || runId !== sortingRunId) return;

    await quickSort(runId, low, pivotIndex - 1);

    if (!sortingRunning || runId !== sortingRunId) return;

    await quickSort(runId, pivotIndex + 1, high);
}

async function partition(runId, low, high) {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (!(await waitForSorting(runId))) return low;

        comparisons++;

        renderArray([j, high]);

        setText(
            "currentAction",
            `Comparing ${arr[j]} with pivot ${pivot}.`
        );

        setText("stepText", "Step " + comparisons);

        if (arr[j] < pivot) {
            i++;

            if (i !== j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                swaps++;
            }
        }

        updateSortingStats();
    }

    if (i + 1 !== high) {
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        swaps++;
    }

    updateSortingStats();

    return i + 1;
}


/* ==================================================
   11. MERGE SORT
================================================== */

async function mergeSort(runId, left, right) {
    if (left >= right) return;

    if (!sortingRunning || runId !== sortingRunId) return;

    const mid = Math.floor((left + right) / 2);

    await mergeSort(runId, left, mid);

    if (!sortingRunning || runId !== sortingRunId) return;

    await mergeSort(runId, mid + 1, right);

    if (!sortingRunning || runId !== sortingRunId) return;

    await merge(runId, left, mid, right);
}

async function merge(runId, left, mid, right) {
    const leftPart = arr.slice(left, mid + 1);
    const rightPart = arr.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftPart.length && j < rightPart.length) {
        if (!(await waitForSorting(runId))) return;

        comparisons++;

        if (leftPart[i] <= rightPart[j]) {
            arr[k] = leftPart[i];
            i++;
        } else {
            arr[k] = rightPart[j];
            j++;
        }

        setText("stepText", "Step " + comparisons);
        setText("currentAction", "Merging sorted parts of the array.");

        renderArray([k]);
        updateSortingStats();

        k++;
    }

    while (i < leftPart.length) {
        arr[k] = leftPart[i];
        i++;
        k++;
    }

    while (j < rightPart.length) {
        arr[k] = rightPart[j];
        j++;
        k++;
    }

    renderArray();
}


/* ==================================================
   12. SORTING PAUSE / RESUME
================================================== */

function pauseAlgorithm() {
    if (!sortingRunning) return;

    sortingPaused = !sortingPaused;

    setText("status", sortingPaused ? "Paused" : "Running");

    document.querySelectorAll("button").forEach(button => {
        if (button.getAttribute("onclick") === "pauseAlgorithm()") {
            button.textContent = sortingPaused ? "▶ Resume" : "⏸ Pause";
        }
    });
}


/* ==================================================
   13. RESET SORTING
================================================== */

function resetVisualizer() {
    sortingRunId++;

    sortingRunning = false;
    sortingPaused = false;

    comparisons = 0;
    swaps = 0;

    document.querySelectorAll("button").forEach(button => {
        if (button.getAttribute("onclick") === "pauseAlgorithm()") {
            button.textContent = "⏸ Pause";
        }
    });

    setText("status", "Ready");
    setText("stepText", "Step 0");
    setText("currentAction", "Visualizer reset.");

    generateArray();
}


/* ==================================================
   14. SEARCHING VARIABLES
================================================== */

let searchArr = [];

let searchRunning = false;
let searchPaused = false;
let searchSpeed = 400;
let searchComparisons = 0;
let searchRunId = 0;


/* ==================================================
   15. GENERATE SEARCH ARRAY
================================================== */

function generateSearchArray() {
    if (searchRunning) return;

    const algorithm = document.getElementById("searchAlgorithm").value;

    searchArr = [];

    for (let i = 0; i < 15; i++) {
        searchArr.push(Math.floor(Math.random() * 90) + 10);
    }

    if (algorithm === "binary") {
        searchArr.sort((a, b) => a - b);
    }

    setText("searchComparisons", 0);
    setText("searchStepText", "Step 0");
    setText("searchResult", "Ready");
    setText("searchStatus", "Ready");
    setText("targetDisplay", "—");
    setText("searchAction", "Array generated. Enter a target and click Search.");

    renderSearchArray();
}


/* ==================================================
   16. DISPLAY SEARCH ARRAY
================================================== */

function renderSearchArray(activeIndex = -1, foundIndex = -1) {
    const container = document.getElementById("searchArray");

    if (!container) return;

    container.innerHTML = "";

    searchArr.forEach((value, index) => {
        const item = document.createElement("div");

        item.textContent = value;

        item.style.width = "48px";
        item.style.height = "48px";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent = "center";
        item.style.borderRadius = "8px";
        item.style.color = "#ffffff";
        item.style.fontWeight = "700";
        item.style.flexShrink = "0";

        if (index === foundIndex) {
            item.style.background = "#35a66f";
        } else if (index === activeIndex) {
            item.style.background = "#ff8a8a";
        } else {
            item.style.background = "#756bd2";
        }

        item.title = "Index: " + index;

        container.appendChild(item);
    });
}


/* ==================================================
   17. SEARCH COMPLEXITY
================================================== */

function changeSearchAlgorithm() {
    if (searchRunning) return;

    const algorithm = document.getElementById("searchAlgorithm").value;

    if (algorithm === "linear") {
        setText(
            "searchExplanation",
            "Linear Search checks each element one by one until the target is found or the array ends."
        );

        setText("searchBest", "O(1)");
        setText("searchAverage", "O(n)");
        setText("searchWorst", "O(n)");
        setText("searchSpace", "O(1)");
    } else {
        setText(
            "searchExplanation",
            "Binary Search requires a sorted array. It checks the middle element and repeatedly halves the search range."
        );

        setText("searchBest", "O(1)");
        setText("searchAverage", "O(log n)");
        setText("searchWorst", "O(log n)");
        setText("searchSpace", "O(1)");
    }

    generateSearchArray();
}


/* ==================================================
   18. SEARCH SPEED
================================================== */

function updateSearchSpeed() {
    const input = document.getElementById("searchSpeed");

    if (!input) return;

    const speed = Number(input.value);

    searchSpeed = Math.max(40, 1000 - speed * 9);

    setText(
        "searchSpeedValue",
        speed >= 75 ? "Fast" : speed <= 25 ? "Slow" : "Medium"
    );
}


/* ==================================================
   19. SEARCH DELAY / PAUSE SUPPORT
================================================== */

function waitForSearch(runId) {
    return new Promise(resolve => {
        const check = () => {
            if (!searchRunning || runId !== searchRunId) {
                resolve(false);
                return;
            }

            if (searchPaused) {
                setTimeout(check, 100);
                return;
            }

            setTimeout(() => {
                resolve(
                    searchRunning && runId === searchRunId
                );
            }, searchSpeed);
        };

        check();
    });
}


/* ==================================================
   20. START SEARCH
================================================== */

async function startSearch() {
    if (searchRunning) return;

    if (searchArr.length === 0) {
        generateSearchArray();
    }

    const input = document.getElementById("target");

    if (!input || input.value.trim() === "") {
        setText("searchAction", "Please enter a target value first.");
        return;
    }

    const target = Number(input.value);

    if (!Number.isFinite(target)) {
        setText("searchAction", "Please enter a valid number.");
        return;
    }

    const algorithm = document.getElementById("searchAlgorithm").value;

    if (algorithm === "binary") {
        searchArr.sort((a, b) => a - b);
        renderSearchArray();
    }

    searchRunning = true;
    searchPaused = false;

    const runId = ++searchRunId;

    searchComparisons = 0;
    let step = 0;
    let foundIndex = -1;

    setText("targetDisplay", target);
    setText("searchComparisons", 0);
    setText("searchStepText", "Step 0");
    setText("searchResult", "Searching...");
    setText("searchStatus", "Running");
    setText("searchAction", "Searching for " + target + "...");

    document.querySelectorAll("button").forEach(button => {
        if (button.getAttribute("onclick") === "pauseSearch()") {
            button.textContent = "⏸ Pause";
        }
    });

    try {
        if (algorithm === "linear") {

            /* Linear Search */

            for (let i = 0; i < searchArr.length; i++) {
                if (!(await waitForSearch(runId))) return;

                step++;
                searchComparisons++;

                renderSearchArray(i);

                setText("searchStepText", "Step " + step);
                setText("searchComparisons", searchComparisons);

                setText(
                    "searchAction",
                    `Checking index ${i}: ${searchArr[i]}`
                );

                if (searchArr[i] === target) {
                    foundIndex = i;
                    break;
                }
            }

        } else {

            /* Binary Search */

            let left = 0;
            let right = searchArr.length - 1;

            while (left <= right) {
                if (!(await waitForSearch(runId))) return;

                const mid = Math.floor((left + right) / 2);

                step++;
                searchComparisons++;

                renderSearchArray(mid);

                setText("searchStepText", "Step " + step);
                setText("searchComparisons", searchComparisons);

                setText(
                    "searchAction",
                    `Checking middle index ${mid}: ${searchArr[mid]}`
                );

                if (searchArr[mid] === target) {
                    foundIndex = mid;
                    break;
                }

                if (searchArr[mid] < target) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }

        if (!searchRunning || runId !== searchRunId) return;

        if (foundIndex !== -1) {
            renderSearchArray(-1, foundIndex);

            setText("searchResult", "Found at index " + foundIndex);
            setText("searchStatus", "Found");

            setText(
                "searchAction",
                `Target ${target} found at index ${foundIndex}.`
            );
        } else {
            renderSearchArray();

            setText("searchResult", "Not Found");
            setText("searchStatus", "Not Found");

            setText(
                "searchAction",
                `Target ${target} is not present in the array.`
            );
        }

    } finally {
        if (runId === searchRunId) {
            searchRunning = false;
            searchPaused = false;
        }
    }
}


/* ==================================================
   21. SEARCH PAUSE / RESUME
================================================== */

function pauseSearch() {
    if (!searchRunning) return;

    searchPaused = !searchPaused;

    setText("searchStatus", searchPaused ? "Paused" : "Running");

    document.querySelectorAll("button").forEach(button => {
        if (button.getAttribute("onclick") === "pauseSearch()") {
            button.textContent = searchPaused ? "▶ Resume" : "⏸ Pause";
        }
    });
}


/* ==================================================
   22. RESET SEARCH
================================================== */

function resetSearch() {
    searchRunId++;

    searchRunning = false;
    searchPaused = false;
    searchComparisons = 0;

    document.querySelectorAll("button").forEach(button => {
        if (button.getAttribute("onclick") === "pauseSearch()") {
            button.textContent = "⏸ Pause";
        }
    });

    setText("searchComparisons", 0);
    setText("searchStepText", "Step 0");
    setText("searchResult", "Ready");
    setText("searchStatus", "Ready");
    setText("targetDisplay", "—");
    setText("searchAction", "Search reset.");

    generateSearchArray();
}


/* ==================================================
   23. INITIALIZE THE APPLICATION
================================================== */

document.addEventListener("DOMContentLoaded", function () {
    updateArraySize();
    updateSpeed();
    updateSortingComplexity();
    generateArray();

    updateSearchSpeed();
    changeSearchAlgorithm();

    showSection("sorting");
});

/* ==========================================
   TREE VISUALIZER - BINARY SEARCH TREE
========================================== */

let treeRoot = null;
let treeHighlights = new Set();
let treeEdgesHighlighted = new Set();

/* Create a new tree node */
function createTreeNode(value) {
    return {
        value: value,
        left: null,
        right: null
    };
}

/* Insert a value into the BST */
function insertTreeNode(root, value) {
    if (root === null) {
        return createTreeNode(value);
    }

    if (value < root.value) {
        root.left = insertTreeNode(root.left, value);
    } else if (value > root.value) {
        root.right = insertTreeNode(root.right, value);
    }

    return root;
}

/* Search for a value */
function searchTreeNode(root, value) {
    if (root === null) return null;
    if (root.value === value) return root;

    if (value < root.value) {
        return searchTreeNode(root.left, value);
    }

    return searchTreeNode(root.right, value);
}

/* Find minimum node */
function findMinimumNode(root) {
    while (root && root.left) {
        root = root.left;
    }
    return root;
}

/* Delete a value from the BST */
function deleteTreeNode(root, value) {
    if (root === null) return null;

    if (value < root.value) {
        root.left = deleteTreeNode(root.left, value);
    } else if (value > root.value) {
        root.right = deleteTreeNode(root.right, value);
    } else {
        if (root.left === null) return root.right;
        if (root.right === null) return root.left;

        const successor = findMinimumNode(root.right);
        root.value = successor.value;
        root.right = deleteTreeNode(root.right, successor.value);
    }

    return root;
}

/* Count tree nodes */
function countTreeNodes(root) {
    if (!root) return 0;
    return 1 + countTreeNodes(root.left) + countTreeNodes(root.right);
}

/* Calculate tree height in levels */
function calculateTreeHeight(root) {
    if (!root) return 0;

    return 1 + Math.max(
        calculateTreeHeight(root.left),
        calculateTreeHeight(root.right)
    );
}

/* Tree traversal */
function getTreeTraversal(root, type, result = []) {
    if (!root) return result;

    if (type === "preorder") {
        result.push(root.value);
    }

    getTreeTraversal(root.left, type, result);

    if (type === "inorder") {
        result.push(root.value);
    }

    getTreeTraversal(root.right, type, result);

    if (type === "postorder") {
        result.push(root.value);
    }

    return result;
}

/* Draw the tree using SVG */
function renderTree() {
    const canvas = document.getElementById("treeCanvas");
    if (!canvas) return;

    if (!treeRoot) {
        canvas.innerHTML = `
            <p class="tree-empty-message">
                Your tree will appear here. Insert a number to get started.
            </p>
        `;
        updateTreeStats();
        return;
    }

    const nodeCount = countTreeNodes(treeRoot);
    const height = calculateTreeHeight(treeRoot);
    const spacingX = 65;
    const spacingY = 85;
    const margin = 40;

    const width = Math.max(320, nodeCount * spacingX + margin * 2);
    const heightSvg = Math.max(160, height * spacingY + margin * 2);

    let nodes = [];
    let edges = [];
    let position = 0;

    function arrange(node, depth) {
        if (!node) return;

        arrange(node.left, depth + 1);

        node._x = margin + position * spacingX + spacingX / 2;
        node._y = margin + depth * spacingY;
        position++;

        nodes.push(node);

        if (node.left) {
            edges.push({
                x1: node._x,
                y1: node._y,
                x2: null,
                y2: null,
                child: node.left
            });
        }

        if (node.right) {
            edges.push({
                x1: node._x,
                y1: node._y,
                x2: null,
                y2: null,
                child: node.right
            });
        }

        arrange(node.right, depth + 1);
    }

    arrange(treeRoot, 0);

    const nodePositions = new Map();
    nodes.forEach(node => {
        nodePositions.set(node.value, { x: node._x, y: node._y });
    });

    const edgeMarkup = edges.map(edge => {
        const childPos = nodePositions.get(edge.child.value);
        const highlighted = treeEdgesHighlighted.has(
            `${edge.x1},${edge.y1}-${childPos.x},${childPos.y}`
        );

        return `
            <line
                class="tree-edge ${highlighted ? "highlight" : ""}"
                x1="${edge.x1}" y1="${edge.y1}"
                x2="${childPos.x}" y2="${childPos.y}"
            />
        `;
    }).join("");

    const nodeMarkup = nodes.map(node => {
        const classes = [
            "tree-node",
            treeHighlights.has(node.value) ? "highlight" : ""
        ].filter(Boolean).join(" ");

        return `
            <g class="${classes}">
                <circle
                    class="tree-node-circle"
                    cx="${node._x}"
                    cy="${node._y}"
                    r="23"
                />
                <text
                    class="tree-node-text"
                    x="${node._x}"
                    y="${node._y}"
                >${node.value}</text>
            </g>
        `;
    }).join("");

    canvas.innerHTML = `
        <svg
            class="tree-svg"
            width="${width}"
            height="${heightSvg}"
            viewBox="0 0 ${width} ${heightSvg}"
            role="img"
            aria-label="Binary Search Tree visualization"
        >
            ${edgeMarkup}
            ${nodeMarkup}
        </svg>
    `;

    updateTreeStats();
}

/* Update tree statistics */
function updateTreeStats() {
    const count = document.getElementById("treeNodeCount");
    const height = document.getElementById("treeHeight");

    if (count) count.textContent = countTreeNodes(treeRoot);
    if (height) height.textContent = calculateTreeHeight(treeRoot);
}

/* Tree status and messages */
function setTreeMessage(message, status = "Ready") {
    const messageEl = document.getElementById("treeMessage");
    const statusEl = document.getElementById("treeStatus");

    if (messageEl) messageEl.textContent = message;
    if (statusEl) statusEl.textContent = status;
}

/* Perform selected tree operation */
function performTreeOperation() {
    const input = document.getElementById("treeValue");
    const operation = document.getElementById("treeOperation").value;

    if (!input || input.value.trim() === "") {
        setTreeMessage("Please enter a number first.", "Input Required");
        return;
    }

    const value = Number(input.value);

    if (!Number.isSafeInteger(value)) {
        setTreeMessage("Please enter a valid whole number.", "Invalid Input");
        return;
    }

    treeHighlights.clear();
    treeEdgesHighlighted.clear();

    if (operation === "insert") {
        if (searchTreeNode(treeRoot, value)) {
            setTreeMessage(
                `${value} already exists. Duplicate values are not inserted.`,
                "Duplicate"
            );
            return;
        }

        treeRoot = insertTreeNode(treeRoot, value);

        treeHighlights.add(value);
        document.getElementById("treeLastOperation").textContent =
            `Insert ${value}`;

        document.getElementById("treeExplanation").textContent =
            `${value} was inserted following the Binary Search Tree rule: smaller values go left and larger values go right.`;

        setTreeMessage(`${value} inserted successfully.`, "Inserted");
    }

    if (operation === "search") {
        const found = searchTreeNode(treeRoot, value);

        if (found) {
            treeHighlights.add(value);
            setTreeMessage(`${value} was found in the tree.`, "Found");
        } else {
            setTreeMessage(`${value} was not found in the tree.`, "Not Found");
        }

        document.getElementById("treeLastOperation").textContent =
            `Search ${value}`;

        document.getElementById("treeExplanation").textContent =
            found
                ? `Search successful: ${value} exists in the Binary Search Tree.`
                : `Search unsuccessful: ${value} does not exist in the Binary Search Tree.`;
    }

    if (operation === "delete") {
        if (!searchTreeNode(treeRoot, value)) {
            setTreeMessage(`${value} does not exist in the tree.`, "Not Found");
            return;
        }

        treeRoot = deleteTreeNode(treeRoot, value);

        document.getElementById("treeLastOperation").textContent =
            `Delete ${value}`;

        document.getElementById("treeExplanation").textContent =
            `${value} was deleted. The remaining tree still follows the Binary Search Tree rule.`;

        setTreeMessage(`${value} deleted successfully.`, "Deleted");
    }

    renderTree();
}

/* Run Inorder, Preorder or Postorder */
function runTreeTraversal() {
    const type = document.getElementById("traversalType").value;

    if (!treeRoot) {
        setTreeMessage("Insert nodes before running a traversal.", "Empty Tree");
        return;
    }

    const result = getTreeTraversal(treeRoot, type);

    treeHighlights = new Set(result);

    const output = document.getElementById("treeTraversalResult");
    if (output) {
        output.textContent =
            `${type.charAt(0).toUpperCase() + type.slice(1)}: ` +
            result.join(" → ");
    }

    document.getElementById("treeLastOperation").textContent =
        `${type.charAt(0).toUpperCase() + type.slice(1)} Traversal`;

    document.getElementById("treeExplanation").textContent = {
        inorder: "Inorder visits Left → Root → Right. In a BST, this produces sorted values.",
        preorder: "Preorder visits Root → Left → Right.",
        postorder: "Postorder visits Left → Right → Root."
    }[type];

    setTreeMessage(`${type} traversal completed.`, "Completed");
    renderTree();
}

/* Generate a sample BST */
function generateSampleTree() {
    treeRoot = null;
    treeHighlights.clear();
    treeEdgesHighlighted.clear();

    [50, 30, 70, 20, 40, 60, 80].forEach(value => {
        treeRoot = insertTreeNode(treeRoot, value);
    });

    document.getElementById("treeLastOperation").textContent = "Sample Tree";
    document.getElementById("treeTraversalResult").textContent =
        "Run a traversal to see the result.";

    setTreeMessage("Sample Binary Search Tree created.", "Sample Loaded");
    renderTree();
}

/* Reset tree */
function resetTree() {
    treeRoot = null;
    treeHighlights.clear();
    treeEdgesHighlighted.clear();

    document.getElementById("treeLastOperation").textContent = "None";
    document.getElementById("treeTraversalResult").textContent =
        "Run a traversal to see the result.";

    document.getElementById("treeExplanation").textContent =
        "A Binary Search Tree stores smaller values on the left and larger values on the right.";

    setTreeMessage("Tree reset. Insert a number to begin.", "Reset");
    renderTree();
}


/* ==========================================
   GRAPH VISUALIZER
   Undirected graph using an adjacency list
========================================== */


/* ==========================================
   GRAPH VISUALIZER - IMPROVED VERSION
   Undirected Graph + BFS + DFS + Shortest Path
========================================== */

let graph = {};
let graphVisited = new Set();
let graphPathEdges = new Set();

/* Normalize node names */
function normalizeGraphLabel(value) {
    return String(value || "").trim().toUpperCase();
}

/* Escape node labels before inserting into SVG */
function escapeGraphText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

/* Generate a unique key for an undirected edge */
function getGraphEdgeKey(a, b) {
    return [a, b].sort().join("|");
}

/* Show graph messages */
function setGraphMessage(message, status = "Ready") {
    const messageEl = document.getElementById("graphMessage");
    const statusEl = document.getElementById("graphStatus");

    if (messageEl) messageEl.textContent = message;
    if (statusEl) statusEl.textContent = status;
}

/* Update graph statistics */
function updateGraphStats() {
    const labels = Object.keys(graph);
    const edgeCount = labels.reduce(
        (total, label) => total + graph[label].length,
        0
    ) / 2;

    const nodeCountEl = document.getElementById("graphNodeCount");
    const edgeCountEl = document.getElementById("graphEdgeCount");

    if (nodeCountEl) nodeCountEl.textContent = labels.length;
    if (edgeCountEl) edgeCountEl.textContent = edgeCount;
}

/* ==========================================
   GRAPH RENDERING
========================================== */

function renderGraph() {
    const canvas = document.getElementById("graphCanvas");
    if (!canvas) return;

    const labels = Object.keys(graph);

    if (labels.length === 0) {
        canvas.innerHTML = `
            <div class="graph-empty-state">
                <div class="graph-empty-icon">✧</div>
                <h4>Your graph will appear here</h4>
                <p>Add a node or load the sample graph to get started.</p>
            </div>
        `;

        updateGraphStats();
        return;
    }

    /*
       Place nodes around a circle.
       Increase the radius as the graph grows so
       nodes have enough room.
    */
    const nodeRadius = 25;
    const circleRadius = Math.max(115, labels.length * 34);
    const padding = 65;
    const width = circleRadius * 2 + padding * 2;
    const height = circleRadius * 2 + padding * 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions = {};

    labels.forEach((label, index) => {
        const angle =
            (2 * Math.PI * index / labels.length) - Math.PI / 2;

        positions[label] = {
            x: centerX + circleRadius * Math.cos(angle),
            y: centerY + circleRadius * Math.sin(angle)
        };
    });

    /* Read start and target selections */
    const start = normalizeGraphLabel(
        document.getElementById("graphStart")?.value
    );

    const target = normalizeGraphLabel(
        document.getElementById("graphTarget")?.value
    );

    /* Draw each undirected edge only once */
    const edges = [];
    const seenEdges = new Set();

    labels.forEach(from => {
        graph[from].forEach(to => {
            const key = getGraphEdgeKey(from, to);

            if (!seenEdges.has(key)) {
                seenEdges.add(key);
                edges.push({ from, to, key });
            }
        });
    });

    const edgeMarkup = edges.map(edge => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        const isPath = graphPathEdges.has(edge.key);

        return `
            <line
                class="graph-edge ${isPath ? "path-edge" : ""}"
                x1="${from.x}"
                y1="${from.y}"
                x2="${to.x}"
                y2="${to.y}"
            />
        `;
    }).join("");

    const nodeMarkup = labels.map(label => {
        const point = positions[label];

        const classes = [
            "graph-node",
            graphVisited.has(label) ? "visited" : "",
            label === start ? "start-node" : "",
            label === target ? "target-node" : ""
        ].filter(Boolean).join(" ");

        return `
            <g class="${classes}">
                <circle
                    class="graph-node-circle"
                    cx="${point.x}"
                    cy="${point.y}"
                    r="${nodeRadius}"
                />
                <text
                    class="graph-node-text"
                    x="${point.x}"
                    y="${point.y}"
                >${escapeGraphText(label)}</text>
            </g>
        `;
    }).join("");

    canvas.innerHTML = `
        <svg
            class="graph-svg"
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            role="img"
            aria-label="Graph with ${labels.length} nodes and ${edges.length} edges"
        >
            ${edgeMarkup}
            ${nodeMarkup}
        </svg>
    `;

    updateGraphStats();
}

/* ==========================================
   GRAPH OPERATIONS
========================================== */

/* Add a node */
function addGraphNode(label) {
    label = normalizeGraphLabel(label);

    if (!label) {
        return {
            success: false,
            message: "Enter a node name first."
        };
    }

    if (graph[label]) {
        return {
            success: false,
            message: `Node ${label} already exists.`
        };
    }

    graph[label] = [];

    return {
        success: true,
        message: `Node ${label} added successfully.`
    };
}

/* Connect two existing nodes */
function addGraphEdge(from, to) {
    from = normalizeGraphLabel(from);
    to = normalizeGraphLabel(to);

    if (!from || !to) {
        return {
            success: false,
            message: "Enter both node names to create a connection."
        };
    }

    if (!graph[from] || !graph[to]) {
        return {
            success: false,
            message: "Add both nodes before connecting them."
        };
    }

    if (from === to) {
        return {
            success: false,
            message: "A node cannot connect to itself."
        };
    }

    if (graph[from].includes(to)) {
        return {
            success: false,
            message: `Connection ${from} — ${to} already exists.`
        };
    }

    graph[from].push(to);
    graph[to].push(from);

    return {
        success: true,
        message: `Connection ${from} — ${to} created successfully.`
    };
}

/* Remove a node and all its connections */
function removeGraphNode(label) {
    label = normalizeGraphLabel(label);

    if (!graph[label]) {
        return {
            success: false,
            message: `Node ${label || "(empty)"} does not exist.`
        };
    }

    Object.keys(graph).forEach(other => {
        graph[other] = graph[other].filter(
            neighbor => neighbor !== label
        );
    });

    delete graph[label];

    graphVisited.clear();
    graphPathEdges.clear();

    return {
        success: true,
        message: `Node ${label} and its connections were removed.`
    };
}

/* Apply the selected graph operation */
function performGraphOperation() {
    const operation = document.getElementById("graphOperation").value;

    const first = normalizeGraphLabel(
        document.getElementById("graphNode").value
    );

    const second = normalizeGraphLabel(
        document.getElementById("graphNode2").value
    );

    let result;

    if (operation === "addNode") {
        result = addGraphNode(first);
    } else if (operation === "addEdge") {
        result = addGraphEdge(first, second);
    } else if (operation === "removeNode") {
        result = removeGraphNode(first);
    } else {
        setGraphMessage("Please select a valid operation.", "Error");
        return;
    }

    if (result.success) {
        graphVisited.clear();
        graphPathEdges.clear();

        const lastAction = {
            addNode: "Add Node",
            addEdge: "Connect Nodes",
            removeNode: "Remove Node"
        };

        document.getElementById("graphLastAlgorithm").textContent =
            lastAction[operation];

        document.getElementById("graphTraversalResult").textContent =
            "Run BFS or DFS to see the traversal order.";

        renderGraph();
    }

    setGraphMessage(
        result.message,
        result.success ? "Completed" : "Notice"
    );
}

/* ==========================================
   BFS - BREADTH FIRST SEARCH
========================================== */

function graphBFS(start) {
    const queue = [start];
    const visited = new Set([start]);
    const order = [];

    while (queue.length > 0) {
        const current = queue.shift();
        order.push(current);

        graph[current].forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        });
    }

    return order;
}

/* ==========================================
   DFS - DEPTH FIRST SEARCH
========================================== */

function graphDFS(start) {
    const visited = new Set();
    const order = [];

    function visit(current) {
        if (visited.has(current)) return;

        visited.add(current);
        order.push(current);

        graph[current].forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visit(neighbor);
            }
        });
    }

    visit(start);
    return order;
}

/* Run selected traversal */
function runGraphTraversal() {
    const labels = Object.keys(graph);

    if (labels.length === 0) {
        setGraphMessage("Load a sample or add nodes first.", "Empty Graph");
        return;
    }

    const requestedStart = normalizeGraphLabel(
        document.getElementById("graphStart").value
    );

    const start = requestedStart || labels[0];

    if (!graph[start]) {
        setGraphMessage(
            `Start node ${start} does not exist. Add it first.`,
            "Invalid Node"
        );
        return;
    }

    const algorithm = document.getElementById("graphAlgorithm").value;

    const order = algorithm === "bfs"
        ? graphBFS(start)
        : graphDFS(start);

    graphVisited = new Set(order);
    graphPathEdges.clear();

    document.getElementById("graphStart").value = start;
    document.getElementById("graphLastAlgorithm").textContent =
        algorithm.toUpperCase();

    document.getElementById("graphTraversalResult").textContent =
        `${algorithm.toUpperCase()} traversal: ${order.join(" → ")}`;

    setGraphMessage(
        `${algorithm.toUpperCase()} completed. ${order.length} reachable node(s) visited.`,
        "Completed"
    );

    renderGraph();
}

/* ==========================================
   SHORTEST PATH - BREADTH FIRST SEARCH
========================================== */

function findGraphPath() {
    const start = normalizeGraphLabel(
        document.getElementById("graphStart").value
    );

    const target = normalizeGraphLabel(
        document.getElementById("graphTarget").value
    );

    if (!start || !target) {
        setGraphMessage(
            "Enter both a start node and a target node.",
            "Input Required"
        );
        return;
    }

    if (!graph[start] || !graph[target]) {
        setGraphMessage(
            "Both start and target nodes must exist in the graph.",
            "Invalid Node"
        );
        return;
    }

    const queue = [start];
    const parent = { [start]: null };
    const visited = new Set([start]);

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === target) break;

        graph[current].forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent[neighbor] = current;
                queue.push(neighbor);
            }
        });
    }

    graphVisited = new Set(visited);
    graphPathEdges.clear();

    document.getElementById("graphLastAlgorithm").textContent =
        "Shortest Path";

    if (!visited.has(target)) {
        document.getElementById("graphTraversalResult").textContent =
            `No path exists from ${start} to ${target}.`;

        setGraphMessage(
            `No connection path found between ${start} and ${target}.`,
            "No Path"
        );

        renderGraph();
        return;
    }

    const path = [];
    let current = target;

    while (current !== null) {
        path.unshift(current);
        current = parent[current];
    }

    graphVisited = new Set(path);

    for (let i = 0; i < path.length - 1; i++) {
        graphPathEdges.add(getGraphEdgeKey(path[i], path[i + 1]));
    }

    document.getElementById("graphTraversalResult").textContent =
        `Shortest path: ${path.join(" → ")} (${path.length - 1} edge(s))`;

    setGraphMessage(
        `Path found from ${start} to ${target} with ${path.length - 1} edge(s).`,
        "Path Found"
    );

    renderGraph();
}

/* ==========================================
   SAMPLE GRAPH
========================================== */

function generateSampleGraph() {
    graph = {};
    graphVisited.clear();
    graphPathEdges.clear();

    ["A", "B", "C", "D", "E", "F"].forEach(label => {
        graph[label] = [];
    });

    const sampleEdges = [
        ["A", "B"],
        ["A", "C"],
        ["B", "D"],
        ["B", "E"],
        ["C", "F"],
        ["E", "F"]
    ];

    sampleEdges.forEach(([from, to]) => {
        graph[from].push(to);
        graph[to].push(from);
    });

    document.getElementById("graphStart").value = "A";
    document.getElementById("graphTarget").value = "F";

    document.getElementById("graphLastAlgorithm").textContent =
        "Sample Graph";

    document.getElementById("graphTraversalResult").textContent =
        "Run BFS or DFS to see the traversal order.";

    setGraphMessage(
        "Sample graph loaded. Try BFS, DFS or Find Shortest Path.",
        "Sample Loaded"
    );

    renderGraph();
}

/* ==========================================
   RESET GRAPH
========================================== */

function resetGraph() {
    graph = {};
    graphVisited.clear();
    graphPathEdges.clear();

    document.getElementById("graphLastAlgorithm").textContent = "None";

    document.getElementById("graphTraversalResult").textContent =
        "Run BFS or DFS to see the traversal order.";

    document.getElementById("graphStart").value = "";
    document.getElementById("graphTarget").value = "";
    document.getElementById("graphNode").value = "";
    document.getElementById("graphNode2").value = "";

    setGraphMessage("Graph cleared. Add nodes to get started.", "Reset");

    renderGraph();
}


/* ==========================================
   INITIALIZE TREE AND GRAPH VISUALIZERS
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    renderTree();
    renderGraph();
});
