const search = document.createElement('input');
search.classList.add('search');

const main = document.querySelector('.main');

const searchList = document.createElement('ul');
searchList.classList.add('search-list');

const repoList = document.createElement('ul');
repoList.classList.add('repo-list');

main.append(search);
main.append(searchList);
main.append(repoList);

function searchRepo(text) {
    return fetch(`https://api.github.com/search/repositories?q=${text}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            const firstElements = data.items.slice(0, 5);
            searchList.innerHTML = '';

            firstElements.forEach((element, index) => {
                printPopup(element, index);
            });

            return firstElements;
        })
        .then((data) => {
            saveSearch('savedSearch', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function saveSearch(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function printPopup(element, index) {
    const repo = document.createElement('span');
    const li = document.createElement('li');

    li.classList.add('search-list__item');
    li.dataset.searchId = index;

    li.append(repo);
    repo.textContent = element.name;

    searchList.append(li);
}

const debounce = (fn, delay) => {
    let timeout;

    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
};

function blurePopup() {
    setTimeout(() => {
        searchList.style.display = 'none';
    }, 200);
}

function showPopup() {
    searchList.style.display = 'block';
}

search.addEventListener('focus', () => showPopup());
search.addEventListener('blur', () => blurePopup());

const debouncedSearchRepo = debounce(searchRepo, 1000);

search.addEventListener('keyup', (e) => {
    if (!search.value) {
        blurePopup();
        return;
    }

    debouncedSearchRepo(search.value);
    showPopup();
});

main.addEventListener('click', (e) => {
    const targetSearchList = e.target.closest('.search-list__item');
    if (targetSearchList) {
        listRepo(targetSearchList.dataset.searchId);
        clearSearch();
    }

    const removeBtn = e.target.closest('.repo-list__btn');
    if (removeBtn) {
        removeRepo(e.target.closest('.repo-list__item'));
    }
});

function clearSearch() {
    search.value = '';
    searchList.innerHTML = '';
}

function listRepo(index) {
    const currentItem = JSON.parse(localStorage.getItem('savedSearch'))[index];
    const { name, owner: { login }, stargazers_count } = currentItem;

    const repoItem = document.createElement('li');
    repoItem.className = 'repo-list__item';

    const repoContent = document.createElement('div');
    repoContent.className = 'repo-list__content';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'repo-list__name';
    nameSpan.textContent = `name: ${name}`;

    const ownerSpan = document.createElement('span');
    ownerSpan.className = 'repo-list__owner';
    ownerSpan.textContent = `owner: ${login}`;

    const starsSpan = document.createElement('span');
    starsSpan.className = 'repo-list__stars';
    starsSpan.textContent = `stars: ${stargazers_count}`;

    const repoBtn = document.createElement('div');
    repoBtn.className = 'repo-list__btn';

    const btnSpan1 = document.createElement('span');
    btnSpan1.className = 'repo-list__btn-line';

    const btnSpan2 = document.createElement('span');
    btnSpan2.className = 'repo-list__btn-line';

    repoContent.append(nameSpan, ownerSpan, starsSpan);
    repoBtn.append(btnSpan1, btnSpan2);
    repoItem.append(repoContent, repoBtn);

    repoList.append(repoItem);
}

function removeRepo(repoItem) {
    repoItem.remove();
}