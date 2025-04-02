let dailyStats = JSON.parse(localStorage.getItem('daily_stats') || '{}');

function showChart() {
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const displayDates = dates.map(d => {
        const date = new Date(d);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    const completed = dates.map(d => dailyStats[d]?.completed || 0);
    const total = dates.map(d => dailyStats[d]?.total || 0);

    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: displayDates,
            datasets: [
                {
                    label: 'Total',
                    data: total,
                    backgroundColor: '#FF5733',
                    borderColor: '#FF5733',
                    borderWidth: 1
                },
                {
                    label: 'Completed',
                    data: completed,
                    type: 'line',
                    borderColor: '#4CAF50',
                    backgroundColor: '#4CAF50',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            scales: {
                y: { beginAtZero: true, ticks: { color: '#CCC' } },
                x: { ticks: { color: '#CCC' } }
            },
            plugins: {
                legend: { labels: { color: '#FFF' } },
                title: { display: true, text: 'Progress 📊', color: '#FFF' }
            }
        }
    });
}

// Inicialização
showChart();