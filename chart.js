let dailyStats = JSON.parse(localStorage.getItem('daily_stats') || '{}');

document.addEventListener("DOMContentLoaded", () => {
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
                    label: 'Completed',
                    data: completed,
                    type: 'line',
                    borderColor: '#4CAF50',
                    backgroundColor: '#4CAF50',
                    fill: false,
                    tension: 0.1,
<<<<<<< HEAD
                    borderWidth: 3,
                    order: 1
=======
                    order: 1 // Ordem menor (fica atrás)
>>>>>>> f542b3117ec470ab8849cad6954574012444d6e4
                },
                {
                    label: 'Total',
                    data: total,
                    backgroundColor: '#FF5733',
                    borderColor: '#FF5733',
                    borderWidth: 1,
<<<<<<< HEAD
                    order: 2
=======
                    order: 2 // Ordem maior (fica na frente)
>>>>>>> f542b3117ec470ab8849cad6954574012444d6e4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFF',
                        font: { size: 14, family: 'Roboto, Arial, sans-serif' },
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#FFF',
                        font: { size: 14, family: 'Roboto, Arial, sans-serif' }
                    },
                    barPercentage: 0.5,
                    categoryPercentage: 0.6
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFF',
                        font: { size: 16, family: 'Roboto, Arial, sans-serif' }
                    }
                },
                title: {
                    display: true,
                    text: 'Progress 📊',
                    color: '#FFF',
                    font: { size: 20, family: 'Roboto, Arial, sans-serif' }
                }
            },
            onClick: (event, elements, chart) => {
                if (!elements.length) return;
                
                const index = elements[0].index;
                const date = displayDates[index];
                const completedValue = completed[index];
                const totalValue = total[index];
                const percentage = totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0;
                
                let tooltip = document.getElementById('statsTooltip');
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.id = 'statsTooltip';
                    document.body.appendChild(tooltip);
                }
                tooltip.innerHTML = `
                    <strong>Data:</strong> ${date}<br>
                    <strong>Concluídas:</strong> <span class="highlight">${completedValue}</span><br>
                    <strong>Total:</strong> ${totalValue}<br>
                    <strong>Porcentagem:</strong> <span class="highlight">${percentage}%</span>
                `;
                tooltip.style.display = 'block';
                
                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;
                let x = event.x + 10;
                let y = event.y - 10;
                
                if (x + tooltipWidth > window.innerWidth) x = event.x - tooltipWidth - 10;
                if (y + tooltipHeight > window.innerHeight) y = event.y - tooltipHeight - 10;
                if (x < 0) x = 10;
                if (y < 0) y = 10;
                
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
                
                setTimeout(() => { tooltip.style.display = 'none'; }, 3000);
            }
        }
    });

<<<<<<< HEAD
    // Ajustar altura do canvas
    const canvas = document.getElementById('progressChart');
    if (canvas) canvas.style.height = '300px';
});
=======
// Inicialização
document.addEventListener("DOMContentLoaded", showChart);
>>>>>>> f542b3117ec470ab8849cad6954574012444d6e4
