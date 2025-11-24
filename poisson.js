function toggleTheme() {
            const root = document.documentElement;
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            document.querySelector('.theme-toggle').textContent = newTheme === 'dark' ? '🌙' : '☀️';
            updateChartTheme();
        }

        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '🌙' : '☀️';
        });

        function factorial(n) {
            if (n <= 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        function poissonPMF(lambda, k) {
            return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
        }

        function poissonCDF(lambda, k) {
            let sum = 0;
            for (let i = 0; i <= k; i++) {
                sum += poissonPMF(lambda, i);
            }
            return sum;
        }

        let pmfChart, cdfChart;

        function getChartColors() {
            const theme = document.documentElement.getAttribute('data-theme');
            return {
                text: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
                grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                accent: '#f59e42',
                accentSecondary: '#f57842'
            };
        }

        function initCharts() {
            const colors = getChartColors();
            
            const pmfCtx = document.getElementById('pmf-chart').getContext('2d');
            pmfChart = new Chart(pmfCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Probability',
                        data: [],
                        backgroundColor: colors.accent,
                        borderColor: colors.accentSecondary,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: colors.text } } },
                    scales: {
                        x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid }, ticks: { color: colors.text }, beginAtZero: true }
                    }
                }
            });

            const cdfCtx = document.getElementById('cdf-chart').getContext('2d');
            cdfChart = new Chart(cdfCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Cumulative Probability',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 66, 0.2)',
                        borderColor: colors.accentSecondary,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: colors.text } } },
                    scales: {
                        x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
                        y: { grid: { color: colors.grid }, ticks: { color: colors.text }, beginAtZero: true, max: 1 }
                    }
                }
            });
        }

        function updateChartTheme() {
            const colors = getChartColors();
            [pmfChart, cdfChart].forEach(chart => {
                chart.options.plugins.legend.labels.color = colors.text;
                chart.options.scales.x.grid.color = colors.grid;
                chart.options.scales.x.ticks.color = colors.text;
                chart.options.scales.y.grid.color = colors.grid;
                chart.options.scales.y.ticks.color = colors.text;
                chart.update();
            });
        }

        function updateCalculations() {
            const lambda = parseFloat(document.getElementById('lambda-input').value);
            const k = parseInt(document.getElementById('k-input').value);

            const pmf = poissonPMF(lambda, k);
            const cdf = poissonCDF(lambda, k);
            const mean = lambda;
            const variance = lambda;
            const stddev = Math.sqrt(lambda);
            const mode = Math.floor(lambda);

            document.getElementById('pmf-result').textContent = pmf.toFixed(4);
            document.getElementById('cdf-result').textContent = cdf.toFixed(4);
            document.getElementById('mean-result').textContent = mean.toFixed(2);
            document.getElementById('variance-result').textContent = variance.toFixed(2);
            document.getElementById('stddev-result').textContent = stddev.toFixed(2);
            document.getElementById('mode-result').textContent = mode;

            updateCharts(lambda, k);
        }

        function updateCharts(lambda, k) {
            const labels = [];
            const pmfData = [];
            const cdfData = [];
            const maxK = Math.ceil(lambda + 4 * Math.sqrt(lambda));

            for (let i = 0; i <= maxK; i++) {
                labels.push(i);
                pmfData.push(poissonPMF(lambda, i));
                cdfData.push(poissonCDF(lambda, i));
            }

            const colors = pmfData.map((_, i) => i === k ? '#f57842' : '#f59e42');

            pmfChart.data.labels = labels;
            pmfChart.data.datasets[0].data = pmfData;
            pmfChart.data.datasets[0].backgroundColor = colors;
            pmfChart.update('none');

            cdfChart.data.labels = labels;
            cdfChart.data.datasets[0].data = cdfData;
            cdfChart.update('none');
        }

        function syncInputs(sliderId, inputId, valueId, decimals = 0) {
            const slider = document.getElementById(sliderId);
            const input = document.getElementById(inputId);
            const valueDisplay = document.getElementById(valueId);

            slider.addEventListener('input', (e) => {
                const value = decimals > 0 ? parseFloat(e.target.value) : parseInt(e.target.value);
                input.value = value;
                valueDisplay.textContent = decimals > 0 ? value.toFixed(decimals) : value;
                updateCalculations();
            });

            input.addEventListener('input', (e) => {
                const value = decimals > 0 ? parseFloat(e.target.value) : parseInt(e.target.value);
                slider.value = value;
                valueDisplay.textContent = decimals > 0 ? value.toFixed(decimals) : value;
                updateCalculations();
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            initCharts();
            syncInputs('lambda-slider', 'lambda-input', 'lambda-value', 2);
            syncInputs('k-slider', 'k-input', 'k-value');
            updateCalculations();
        });