import { getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Fetch categories and display them in the categories container
export async function fetchCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = ""; // Clear the container before adding categories
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        querySnapshot.forEach((doc) => {
            const category = doc.data();
            const card = document.createElement('div');
            card.classList.add('card');
            
            card.innerHTML = `
                <h3>${category.categoryName}</h3>
    <button class="delete-btn">x</button>
`;

            card.addEventListener('click', () => {
                navigateToSubcategories(doc.id);
            });

            card.querySelector('.delete-btn').addEventListener('click', (event) => {
                event.stopPropagation(); // Prevents the click from propagating to the card
                confirmDelete('category', doc.id);
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

export async function fetchSubcategories(categoryId) {
    const subcategoriesContainer = document.getElementById('subcategoriesContainer');
    subcategoriesContainer.innerHTML = ""; // Clear the container before adding subcategories
    try {
        const querySnapshot = await getDocs(collection(db, "categories", categoryId, "subcategories"));
        querySnapshot.forEach((doc) => {
            const subcategory = doc.data();
            const card = document.createElement('div');
            card.classList.add('card');
            
            card.innerHTML = `
                 <h3>${subcategory.subcategoryName}</h3>
    <img src="${subcategory.subcategoryImage}" alt="${subcategory.subcategoryName}" class="subcategory-image">
    <p style="font-size: 0.9em; color: grey;">
        ${subcategory.isAdapted ? "Adaptada" : "Não adaptada"}
    </p>
    <button class="delete-btn">x</button>
`;

            card.addEventListener('click', () => {
                navigateToQuestions(categoryId, doc.id);
            });

            card.querySelector('.delete-btn').addEventListener('click', (event) => {
                event.stopPropagation(); // Prevents the click from propagating to the card
                confirmDelete('subcategory', doc.id, categoryId);
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

// Fetch questions and display them in the questions container
export async function fetchQuestions(categoryId, subcategoryId, showDeleteButton = true) {
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = ""; // Clear the container before adding questions
    try {
        const querySnapshot = await getDocs(collection(db, "categories", categoryId, "subcategories", subcategoryId, "questions"));
        querySnapshot.forEach((doc) => {
            const question = doc.data();
            questionsContainer.innerHTML += `
                <div class="card" data-doc-id="${doc.id}">
                    <h3>Questão ${question.index}</h3>
                    <p>${question.question}</p>
                    ${showDeleteButton ? `<button class="delete-btn" onclick="confirmDelete('question', '${doc.id}', '${categoryId}', '${subcategoryId}')">x</button>` : ""}
                </div>
            `;
        });

        if (querySnapshot.empty) {
            questionsContainer.innerHTML = "<p>Nenhuma questão encontrada.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar questões: ", error);
        questionsContainer.innerHTML = "<p>Erro ao carregar questões.</p>";
    }
}

// Função para confirmar a exclusão de um documento
function confirmDelete(type, docId, categoryId = null, subcategoryId = null) {
    if (confirm("Tem certeza de que deseja excluir este item?")) {
        if (type === 'category') {
            deleteCategory(docId);
        } else if (type === 'subcategory') {
            deleteSubcategory(categoryId, docId);
        } else if (type === 'question') {
            deleteQuestion(categoryId, subcategoryId, docId);
        }
    }
}

// Função para deletar uma categoria
async function deleteCategory(categoryId) {
    try {
        await deleteDoc(doc(db, "categories", categoryId)); 
        alert("Categoria excluída com sucesso!");
        window.location.reload();
    } catch (error) {
        console.error("Erro ao excluir categoria: ", error);
        alert("Erro ao excluir categoria.");
    }
}

// Função para deletar uma subcategoria
async function deleteSubcategory(categoryId, subcategoryId) {
    try {
        await deleteDoc(doc(db, "categories", categoryId, "subcategories", subcategoryId));
        alert("Subcategoria excluída com sucesso!");
        window.location.reload();
    } catch (error) {
        console.error("Erro ao excluir subcategoria: ", error);
        alert("Erro ao excluir subcategoria.");
    }
}

// Função para deletar uma questão
async function deleteQuestion(categoryId, subcategoryId, questionId) {
    try {
        await deleteDoc(doc(db, "categories", categoryId, "subcategories", subcategoryId, "questions", questionId));
        alert("Questão excluída com sucesso!");
        window.location.reload();
    } catch (error) {
        console.error("Erro ao excluir questão: ", error);
        alert("Erro ao excluir questão.");
    }
}

// Função para editar uma questão existente
export async function editQuestion(categoryId, subcategoryId, questionId) {
    try {
        const docRef = doc(db, "categories", categoryId, "subcategories", subcategoryId, "questions", questionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const question = docSnap.data();
            document.getElementById('editTextQuestion').value = question.question || "";
            document.getElementById('editTextOption1').value = question.option1 || "";
            document.getElementById('editTextOption2').value = question.option2 || "";
            document.getElementById('editTextOption3').value = question.option3 || "";
            document.getElementById('editTextOption4').value = question.option4 || "";
            document.getElementById('editTextAnswer').value = question.answer || "";
            document.getElementById('editTextImageUrl').value = question.imageUrl || "";
            document.getElementById('editTextIndex').value = question.index || "";

        } else {
            alert("Questão não encontrada.");
        }
    } catch (error) {
        console.error("Erro ao carregar questão: ", error);
        alert("Erro ao carregar questão.");
    }
}

// Função para atualizar a questão no Firestore
export async function updateQuestion(categoryId, subcategoryId, questionId) {
    try {
        const docRef = doc(db, "categories", categoryId, "subcategories", subcategoryId, "questions", questionId);
        await updateDoc(docRef, {
            question: document.getElementById('editTextQuestion').value,
            option1: document.getElementById('editTextOption1').value || null,
            option2: document.getElementById('editTextOption2').value || null,
            option3: document.getElementById('editTextOption3').value || null,
            option4: document.getElementById('editTextOption4').value || null,
            answer: document.getElementById('editTextAnswer').value,
            imageUrl: document.getElementById('editTextImageUrl').value || null,
            index: parseInt(document.getElementById('editTextIndex').value)
        });

        alert("Questão atualizada com sucesso!");
        window.location.href = `questions.html?categoryId=${categoryId}&subcategoryId=${subcategoryId}`;
    } catch (error) {
        console.error("Erro ao atualizar questão: ", error);
        alert("Erro ao atualizar questão.");
    }
}

export async function addQuestion(categoryId, subcategoryId) {
    const question = document.getElementById('editTextQuestion').value;
    const option1 = document.getElementById('editTextOption1').value;
    const option2 = document.getElementById('editTextOption2').value;
    const option3 = document.getElementById('editTextOption3').value;
    const option4 = document.getElementById('editTextOption4').value;
    const answer = document.getElementById('editTextAnswer').value;
    const imageUrl = document.getElementById('editTextImageUrl').value;
    const index = document.getElementById('editTextIndex').value;

    if (question === "" || answer === "" || index === "") {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    try {
        await addDoc(collection(db, "categories", categoryId, "subcategories", subcategoryId, "questions"), {
            question: question,
            option1: option1 || null,
            option2: option2 || null,
            option3: option3 || null,
            option4: option4 || null,
            answer: answer,
            imageUrl: imageUrl || null,
            index: parseInt(index)
        });

        alert("Questão adicionada com sucesso!");
        window.location.href = `questions.html?categoryId=${categoryId}&subcategoryId=${subcategoryId}`;
    } catch (error) {
        console.error("Erro ao adicionar questão: ", error);
        alert("Erro ao adicionar questão.");
    }
}

export async function addCategory() {
    const categoryName = document.getElementById('editTextCategoryName').value;
    const categoryImage = document.getElementById('editTextCategoryImage').value;

    if (categoryName === "" || categoryImage === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        await addDoc(collection(db, "categories"), {
            categoryName: categoryName,
            categoryImage: categoryImage
        });

        alert("Categoria adicionada com sucesso!");
        window.location.href = "categories.html";
    } catch (error) {
        console.error("Erro ao adicionar categoria: ", error);
        alert("Erro ao adicionar categoria.");
    }
}

export async function addSubcategory(categoryId) {
    const subcategoryName = document.getElementById('editTextSubcategoryName').value;
    const subcategoryImage = document.getElementById('editTextSubcategoryImage').value;
    const maxIndex = document.getElementById('editTextMaxIndex').value;
    const questionsCount = document.getElementById('editTextQuestionsCount').value;
    const pointsPerQuestion = document.getElementById('editTextpointsPerQuestion').value;
    const time = document.getElementById('editTextTime').value;
    const isAdapted = document.getElementById('spinnerIsAdapted').value === "true";

    if (subcategoryName === "" || subcategoryImage === "" || maxIndex === "" || questionsCount === "" || pointsPerQuestion === "" || time === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        await addDoc(collection(db, "categories", categoryId, "subcategories"), {
            subcategoryName: subcategoryName,
            subcategoryImage: subcategoryImage,
            maxIndex: parseInt(maxIndex),
            questionsCount: parseInt(questionsCount),
            pointsPerQuestion: parseInt(pointsPerQuestion),
            time: parseInt(time),
            isAdapted: isAdapted
        });

        alert("Subcategoria adicionada com sucesso!");
        window.location.href = `subcategories.html?categoryId=${categoryId}`;
    } catch (error) {
        console.error("Erro ao adicionar subcategoria: ", error);
        alert("Erro ao adicionar subcategoria.");
    }
}

// Funções de navegação
function navigateToSubcategories(categoryId) {
    window.location.href = `subcategories.html?categoryId=${categoryId}`;
}

function navigateToQuestions(categoryId, subcategoryId) {
    window.location.href = `questions.html?categoryId=${categoryId}&subcategoryId=${subcategoryId}`;
}

// Export funções necessárias para o escopo global
window.addSubcategory = addSubcategory;
window.addCategory = addCategory;
window.addQuestion = addQuestion;
window.navigateToSubcategories = navigateToSubcategories;
window.navigateToQuestions = navigateToQuestions;
window.deleteCategory = deleteCategory;
window.deleteSubcategory = deleteSubcategory;
window.editQuestion = editQuestion;
window.updateQuestion = updateQuestion;
window.confirmDelete = confirmDelete;