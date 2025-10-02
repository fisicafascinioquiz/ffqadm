import { 
    getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

// ----------------------
// Função auxiliar para tratar o link do Drive
// ----------------------
function formatGoogleDriveUrl(url) {
    if (!url) return "";
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
        return `https://drive.google.com/uc?id=${match[1]}`;
    }
    return url;
}

// ----------------------
// Fetch de categorias
// ----------------------
export async function fetchCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        querySnapshot.forEach((docSnap) => {
            const category = docSnap.data();
            const card = document.createElement('div');
            card.classList.add('card');
            
            card.innerHTML = `
                <h3>${category.categoryName}</h3>
                <button class="delete-btn">x</button>
            `;

            card.addEventListener('click', () => {
                navigateToSubcategories(docSnap.id);
            });

            card.querySelector('.delete-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                confirmDelete('category', docSnap.id);
            });

            categoriesContainer.appendChild(card);
        });

        if (querySnapshot.empty) {
            categoriesContainer.innerHTML = "<p>Nenhuma categoria encontrada.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar categorias: ", error);
        categoriesContainer.innerHTML = "<p>Erro ao carregar categorias.</p>";
    }
}

// ----------------------
// Fetch de subcategorias
// ----------------------
export async function fetchSubcategories(categoryId) {
    const subcategoriesContainer = document.getElementById('subcategoriesContainer');
    subcategoriesContainer.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "categories", categoryId, "subcategories"));
        querySnapshot.forEach((docSnap) => {
            const subcategory = docSnap.data();
            const card = document.createElement('div');
            card.classList.add('card');
            
            card.innerHTML = `
                <h3>${subcategory.subcategoryName}</h3>
                <img src="${subcategory.subcategoryImage}" alt="${subcategory.subcategoryName}" class="subcategory-image">
                <p style="font-size: 0.9em; color: grey;">
                    ${subcategory.isAdapted ? "Adaptada" : "Não adaptada"}
                </p>
                ${subcategory.order ? `<p>Ordem: ${subcategory.order}</p>` : ""}
                ${subcategory.ebookPdfUrl ? `<a href="${subcategory.ebookPdfUrl}" target="_blank">📘 Ebook</a>` : ""}
                <button class="delete-btn">x</button>
            `;

            card.addEventListener('click', () => {
                navigateToQuestions(categoryId, docSnap.id);
            });

            card.querySelector('.delete-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                confirmDelete('subcategory', docSnap.id, categoryId);
            });

            subcategoriesContainer.appendChild(card);
        });

        if (querySnapshot.empty) {
            subcategoriesContainer.innerHTML = "<p>Nenhuma subcategoria encontrada.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar subcategorias: ", error);
        subcategoriesContainer.innerHTML = "<p>Erro ao carregar subcategorias.</p>";
    }
}

// ----------------------
// ADD SUBCATEGORY (atualizado)
// ----------------------
export async function addSubcategory(categoryId) {
    const subcategoryName = document.getElementById('editTextSubcategoryName').value;
    const subcategoryImage = document.getElementById('editTextSubcategoryImage').value;
    const maxIndex = document.getElementById('editTextMaxIndex').value;
    const questionsCount = document.getElementById('editTextQuestionsCount').value;
    const pointsPerQuestion = document.getElementById('editTextpointsPerQuestion').value;
    const time = document.getElementById('editTextTime').value;
    const isAdapted = document.getElementById('spinnerIsAdapted').value === "true";
    const order = document.getElementById('editTextOrder')?.value || "";
    const ebookPdfUrlInput = document.getElementById('editTextEbookPdfUrl')?.value || "";
    const ebookPdfUrl = formatGoogleDriveUrl(ebookPdfUrlInput);

    if (subcategoryName === "" || subcategoryImage === "" || maxIndex === "" || questionsCount === "" || pointsPerQuestion === "" || time === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        await addDoc(collection(db, "categories", categoryId, "subcategories"), {
            subcategoryName,
            subcategoryImage,
            maxIndex: parseInt(maxIndex),
            questionsCount: parseInt(questionsCount),
            pointsPerQuestion: parseInt(pointsPerQuestion),
            time: parseInt(time),
            isAdapted,
            order,
            ebookPdfUrl
        });

        alert("Subcategoria adicionada com sucesso!");
        window.location.href = `subcategories.html?categoryId=${categoryId}`;
    } catch (error) {
        console.error("Erro ao adicionar subcategoria: ", error);
        alert("Erro ao adicionar subcategoria.");
    }
}

// ----------------------
// EDIT SUBCATEGORY (carrega os dados para tela de edição)
// ----------------------
export async function editSubcategory(categoryId, subcategoryId) {
    try {
        const docRef = doc(db, "categories", categoryId, "subcategories", subcategoryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('editTextSubcategoryName').value = data.subcategoryName || "";
            document.getElementById('editTextSubcategoryImage').value = data.subcategoryImage || "";
            document.getElementById('editTextMaxIndex').value = data.maxIndex || "";
            document.getElementById('editTextQuestionsCount').value = data.questionsCount || "";
            document.getElementById('editTextpointsPerQuestion').value = data.pointsPerQuestion || "";
            document.getElementById('editTextTime').value = data.time || "";
            document.getElementById('spinnerIsAdapted').value = data.isAdapted ? "true" : "false";
            document.getElementById('editTextOrder').value = data.order || "";
            document.getElementById('editTextEbookPdfUrl').value = data.ebookPdfUrl || "";
        } else {
            alert("Subcategoria não encontrada.");
        }
    } catch (error) {
        console.error("Erro ao carregar subcategoria: ", error);
        alert("Erro ao carregar subcategoria.");
    }
}

// ----------------------
// UPDATE SUBCATEGORY (salva alterações)
// ----------------------
export async function updateSubcategory(categoryId, subcategoryId) {
    try {
        const docRef = doc(db, "categories", categoryId, "subcategories", subcategoryId);
        
        const ebookPdfUrlInput = document.getElementById('editTextEbookPdfUrl').value;
        const ebookPdfUrl = formatGoogleDriveUrl(ebookPdfUrlInput);

        await updateDoc(docRef, {
            subcategoryName: document.getElementById('editTextSubcategoryName').value,
            subcategoryImage: document.getElementById('editTextSubcategoryImage').value,
            maxIndex: parseInt(document.getElementById('editTextMaxIndex').value),
            questionsCount: parseInt(document.getElementById('editTextQuestionsCount').value),
            pointsPerQuestion: parseInt(document.getElementById('editTextpointsPerQuestion').value),
            time: parseInt(document.getElementById('editTextTime').value),
            isAdapted: document.getElementById('spinnerIsAdapted').value === "true",
            order: document.getElementById('editTextOrder').value,
            ebookPdfUrl
        });

        alert("Subcategoria atualizada com sucesso!");
        window.location.href = `subcategories.html?categoryId=${categoryId}`;
    } catch (error) {
        console.error("Erro ao atualizar subcategoria: ", error);
        alert("Erro ao atualizar subcategoria.");
    }
}

// ----------------------
// Navegação
// ----------------------
function navigateToSubcategories(categoryId) {
    window.location.href = `subcategories.html?categoryId=${categoryId}`;
}

function navigateToQuestions(categoryId, subcategoryId) {
    window.location.href = `questions.html?categoryId=${categoryId}&subcategoryId=${subcategoryId}`;
}

// ----------------------
// Export para global (HTML chama essas funções)
// ----------------------
window.addSubcategory = addSubcategory;
window.editSubcategory = editSubcategory;
window.updateSubcategory = updateSubcategory;
window.navigateToSubcategories = navigateToSubcategories;
window.navigateToQuestions = navigateToQuestions;
