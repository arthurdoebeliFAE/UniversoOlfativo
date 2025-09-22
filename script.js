document.addEventListener('DOMContentLoaded', () => {

    // Seleciona o formulário de feedback
    const feedbackForm = document.getElementById('feedback-form');

    // Se o formulário existir nesta página, executa todo o código.
    // Isso evita erros nas páginas que não têm o formulário.
    if (feedbackForm) {
        const userNameInput = document.getElementById('userName');
        const userCommentInput = document.getElementById('userComment');
        const feedbackList = document.getElementById('feedback-list');
        const chartCanvas = document.getElementById('feedbackChart').getContext('2d');
        const stars = document.querySelectorAll('.star');
        const ratingValueInput = document.getElementById('ratingValue');
        const filterButtons = document.querySelectorAll('.filter-btn');
        let currentFilter = 'all';
        let feedbackChart;

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                ratingValueInput.value = value;
                stars.forEach(s => s.classList.remove('selected'));
                for (let i = 0; i < value; i++) {
                    stars[i].classList.add('selected');
                }
            });
        });

        const getFeedbacks = () => JSON.parse(localStorage.getItem('feedbacks')) || [];
        const saveFeedbacks = (feedbacks) => localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        const renderFeedbacks = () => {
            let feedbacks = getFeedbacks();
            feedbackList.innerHTML = '';
            if (currentFilter !== 'all') {
                feedbacks = feedbacks.filter(fb => fb.rating === parseInt(currentFilter));
            }
            if (feedbacks.length === 0) {
                feedbackList.innerHTML = '<p>Nenhum feedback encontrado para este filtro.</p>';
                return;
            }
            feedbacks.slice().reverse().forEach(fb => {
                const feedbackElement = document.createElement('div');
                feedbackElement.classList.add('feedback-item');
                const ratingStars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
                feedbackElement.innerHTML = `<p class="name">${fb.name} <span class="rating">${ratingStars}</span></p><p class="comment">"${fb.comment || 'Nenhum comentário.'}"</p>`;
                feedbackList.appendChild(feedbackElement);
            });
        };

        const renderChart = () => {
            let feedbacks = getFeedbacks();
            if (currentFilter !== 'all') {
                feedbacks = feedbacks.filter(fb => fb.rating === parseInt(currentFilter));
            }
            const ratingCounts = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
            feedbacks.forEach(fb => { ratingCounts[fb.rating]++; });
            const chartData = {
                labels: ['1 Estrela', '2 Estrelas', '3 Estrelas', '4 Estrelas', '5 Estrelas'],
                datasets: [{
                    label: 'Número de Avaliações',
                    data: Object.values(ratingCounts),
                    backgroundColor: 'rgba(212, 212, 212, 0.2)',
                    borderColor: 'rgba(212, 212, 212, 1)',
                    borderWidth: 1
                }]
            };
            if (feedbackChart) {
                feedbackChart.data = chartData;
                feedbackChart.update();
            } else {
                feedbackChart = new Chart(chartCanvas, {
                    type: 'bar', data: chartData,
                    options: {
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#a0a0a0', stepSize: 1 }, grid: { color: '#333333' } },
                            x: { ticks: { color: '#a0a0a0' }, grid: { color: '#333333' } }
                        },
                        plugins: { legend: { labels: { color: '#f0f0f0' } } }
                    }
                });
            }
        };

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentFilter = button.dataset.filter;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderFeedbacks();
                renderChart();
            });
        });

        feedbackForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const userName = userNameInput.value.trim();
            const userRating = ratingValueInput.value;
            const userComment = userCommentInput.value.trim();
            if (!userName || !userRating) {
                alert('Por favor, preencha o nome e a nota.');
                return;
            }
            const newFeedback = { id: Date.now(), name: userName, rating: parseInt(userRating), comment: userComment };
            const feedbacks = getFeedbacks();
            feedbacks.push(newFeedback);
            saveFeedbacks(feedbacks);
            feedbackForm.reset();
            ratingValueInput.value = '';
            stars.forEach(s => s.classList.remove('selected'));
            renderFeedbacks();
            renderChart();
        });

        renderFeedbacks();
        renderChart();
    }
});