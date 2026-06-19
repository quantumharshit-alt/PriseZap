document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Drawer Navigation ---
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      
      // Animate hamburger to X
      const bars = mobileToggle.querySelectorAll('.bar');
      if (mobileToggle.classList.contains('active')) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    // Close drawer when link clicked
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
        mobileToggle.querySelectorAll('.bar')[1].style.opacity = '1';
      });
    });
  }

  // --- Interactive Pricing Simulator (Hero Section) ---
  const compSlider = document.getElementById('slider-competitor');
  const demandSlider = document.getElementById('slider-demand');
  const stockSlider = document.getElementById('slider-stock');

  const compValText = document.getElementById('comp-val');
  const zapValText = document.getElementById('zap-val');
  const liftValText = document.getElementById('lift-val');

  const sliderCompLabel = document.getElementById('slider-comp-val');
  const sliderDemandLabel = document.getElementById('slider-demand-val');
  const sliderStockLabel = document.getElementById('slider-stock-val');

  const chartPathComp = document.getElementById('chart-path-comp');
  const chartPathZap = document.getElementById('chart-path-zap');
  const chartAreaZap = document.getElementById('chart-area-zap');
  const chartPoint = document.getElementById('chart-point');

  function updatePricingSimulator() {
    const compVal = parseInt(compSlider.value);
    const demandVal = parseInt(demandSlider.value);
    const stockVal = parseInt(stockSlider.value);

    // 1. Calculate values for display
    // Competitor Base Price is ₹4000, varies up to ₹10000
    const competitorPrice = 4000 + (compVal * 60);
    
    // PriceZap AI calculates optimal price based on competitor price, demand, and inventory
    // If inventory is high (overstock), AI lowers price to liquidate
    // If demand is high, AI can capture higher margin
    // AI avoids direct price war unless overstocked
    const demandMultiplier = 1 + ((demandVal - 50) / 250); // -20% to +20%
    const stockDiscount = ((stockVal - 50) / 100) * 1500; // -₹750 to +₹750 price shift
    
    let zapPrice = competitorPrice * demandMultiplier - stockDiscount;
    // Keep pricing realistic
    if (zapPrice < 2500) zapPrice = 2500;
    if (zapPrice > 15000) zapPrice = 15000;

    // Projected Lift Calculation
    // Lift is maximized when pricing is optimized compared to raw competitor matches
    const liftBase = 8.5;
    const demandLift = (demandVal / 100) * 12;
    const inventoryLift = ((100 - stockVal) / 100) * 8;
    const lift = liftBase + demandLift + inventoryLift + (Math.abs(zapPrice - competitorPrice) * 0.15);

    // Update Text Elements
    compValText.textContent = `₹${Math.round(competitorPrice).toLocaleString('en-IN')}`;
    zapValText.textContent = `₹${Math.round(zapPrice).toLocaleString('en-IN')}`;
    liftValText.textContent = `+${lift.toFixed(1)}%`;

    // Update E-commerce Product Mock Card
    const prodCurrentPrice = document.getElementById('prod-current-price');
    if (prodCurrentPrice) {
      prodCurrentPrice.textContent = `₹${Math.round(zapPrice).toLocaleString('en-IN')}`;
    }

    const stockStatusText = document.getElementById('stock-status-text');
    const stockDot = document.getElementById('stock-dot-indicator');
    if (stockStatusText && stockDot) {
      const units = Math.round(150 - (stockVal * 1.3));
      stockStatusText.textContent = `In Stock (${units} units)`;
      
      if (units < 20) {
        stockStatusText.textContent = `Low Stock (${units} units)`;
        stockDot.style.backgroundColor = '#ef4444';
        stockDot.style.boxShadow = '0 0 8px #ef4444';
      } else if (units < 60) {
        stockDot.style.backgroundColor = '#f59e0b';
        stockDot.style.boxShadow = '0 0 8px #f59e0b';
      } else {
        stockDot.style.backgroundColor = '#00ff66';
        stockDot.style.boxShadow = '0 0 8px #00ff66';
      }
    }

    // Update Slider Label Details
    if (compVal < 30) {
      sliderCompLabel.textContent = "Aggressive Discount";
    } else if (compVal > 70) {
      sliderCompLabel.textContent = "Premium Matching";
    } else {
      sliderCompLabel.textContent = "Standard Market";
    }

    if (demandVal < 30) {
      sliderDemandLabel.textContent = "Price Sensitive";
    } else if (demandVal > 70) {
      sliderDemandLabel.textContent = "Surging Volume";
    } else {
      sliderDemandLabel.textContent = "Stable Demand";
    }

    if (stockVal < 30) {
      sliderStockLabel.textContent = "Low Stock (Maximize Margin)";
    } else if (stockVal > 70) {
      sliderStockLabel.textContent = "Overstock (Push Velocity)";
    } else {
      sliderStockLabel.textContent = "Healthy Levels";
    }

    // 2. Redraw SVG Chart Paths
    // SVG Dimensions: 400 width, 180 height
    // Draw waves representing historical/trend lines
    const pointsCount = 6;
    const width = 400;
    const height = 180;
    const step = width / (pointsCount - 1);
    
    let compPoints = [];
    let zapPoints = [];

    // Helper: Map price to SVG Y position (Y runs 0 to 180, higher price is lower Y)
    function priceToY(price) {
      const minP = 2000;
      const maxP = 16000;
      return height - 20 - ((price - minP) / (maxP - minP)) * (height - 40);
    }

    for (let i = 0; i < pointsCount; i++) {
      const x = i * step;
      
      // Create organic looking wave shapes
      const compWave = Math.sin(i * 1.5) * 8 + Math.cos(i * 0.8) * 4;
      const compP = competitorPrice + compWave;
      const compY = priceToY(compP);
      compPoints.push({ x, y: compY });

      // PriceZap AI curve adapts dynamically to competitor trends and optimizer states
      const zapWave = Math.cos(i * 1.2) * 5 + Math.sin(i * 0.9) * 3;
      // AI adjusts lead-lag logic dynamically per step
      let stepZapPrice = zapPrice + zapWave;
      
      // In steps 1-3 AI might observe and react, steps 4-5 optimize
      if (i < 3) {
        stepZapPrice = (competitorPrice * 0.96) + zapWave + (demandVal * 0.05) - (stockVal * 0.05);
      }
      
      const zapY = priceToY(stepZapPrice);
      zapPoints.push({ x, y: zapY });
    }

    // Construct SVG path strings (Catmull-Rom or cubic spline approximations using Bezier)
    function buildPath(points) {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        // Control points for smooth bezier connection
        const cpX1 = p0.x + step / 2;
        const cpY1 = p0.y;
        const cpX2 = p1.x - step / 2;
        const cpY2 = p1.y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      return path;
    }

    const pathCompStr = buildPath(compPoints);
    const pathZapStr = buildPath(zapPoints);

    chartPathComp.setAttribute('d', pathCompStr);
    chartPathZap.setAttribute('d', pathZapStr);

    // Area under AI curve (closes path to bottom right, bottom left, and back to start)
    const areaZapStr = `${pathZapStr} L ${width} ${height} L 0 ${height} Z`;
    chartAreaZap.setAttribute('d', areaZapStr);

    // Place the highlight cursor point on the active peak (index 4 out of 5)
    const highlightPoint = zapPoints[4];
    chartPoint.setAttribute('cx', highlightPoint.x);
    chartPoint.setAttribute('cy', highlightPoint.y);
  }

  // Event Listeners for Simulator Sliders
  if (compSlider && demandSlider && stockSlider) {
    [compSlider, demandSlider, stockSlider].forEach(slider => {
      slider.addEventListener('input', updatePricingSimulator);
    });
    // Init on load
    updatePricingSimulator();
  }

  // --- Excel/CSV Catalog Upload Handling ---
  const csvFile = document.getElementById('csv-file');
  const fileName = document.getElementById('file-name');

  if (csvFile) {
    csvFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      fileName.textContent = file.name;

      // Parse CSV File in Browser
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          const data = results.data;
          
          // Filter out rows missing core details
          const validProducts = data.filter(row => row.product_name && row.price);
          
          if (validProducts.length > 0) {
            alert(`🎉 Successfully parsed Excel CSV! Loaded ${validProducts.length} products.`);
            
            // Extract details of the first product
            const firstProd = validProducts[0];
            
            // Map details to catalog sneaker card
            const prodName = document.querySelector('.product-name');
            const prodCurrentPrice = document.getElementById('prod-current-price');
            const compValText = document.getElementById('comp-val');
            
            if (prodName) prodName.textContent = firstProd.product_name;
            if (prodCurrentPrice) prodCurrentPrice.textContent = `₹${firstProd.price.toLocaleString('en-IN')}`;
            
            // Competitor price calculation
            const compPrice = firstProd.competitor_price || (firstProd.price * 1.12);
            if (compValText) compValText.textContent = `₹${Math.round(compPrice).toLocaleString('en-IN')}`;
            
            // Map stock levels (say 0-150 range) to the stock slider value (0-100 scale)
            if (firstProd.stock !== undefined) {
              const stockSlider = document.getElementById('slider-stock');
              if (stockSlider) {
                // Convert stock quantity into percentage slider index
                const stockPercent = Math.min(100, Math.round(((150 - firstProd.stock) / 1.3)));
                stockSlider.value = stockPercent;
              }
            }
            
            // Recalculate optimizer outputs based on the new data
            updatePricingSimulator();
          } else {
            alert("⚠️ No valid products found. Make sure your CSV file has 'product_name' and 'price' as headers.");
          }
        }
      });
    });
  }

  // --- Interactive ROI Calculator ---
  const salesSlider = document.getElementById('monthly-sales');
  const hoursSlider = document.getElementById('pricing-hours');
  const salesValText = document.getElementById('sales-val');
  const hoursValText = document.getElementById('hours-val');
  const gainRevText = document.getElementById('gain-rev');
  const gainTimeText = document.getElementById('gain-time');
  const gainMarginText = document.getElementById('gain-margin');

  function formatCurrency(value) {
    if (value >= 10000000) { // 1 Crore = 10,000,000
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) { // 1 Lakh = 100,000
      return `₹${(value / 100000).toFixed(1)} Lakh`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  }

  function updateCalculator() {
    const monthlySales = parseInt(salesSlider.value);
    const pricingHours = parseInt(hoursSlider.value);

    // Display inputs
    salesValText.textContent = formatCurrency(monthlySales);
    hoursValText.textContent = `${pricingHours} hours`;

    // Compute Outputs
    const revenueGain = monthlySales * 0.12;
    const monthlyHoursReclaimed = Math.round(pricingHours * 4.33 * 0.65); // 65% reduction

    // Calculate gross margin increase
    let marginIncreasePercent = 12.0 + (monthlySales / 10000000) * 1.0;
    if (marginIncreasePercent > 18.0) marginIncreasePercent = 18.0;

    // Update outputs
    gainRevText.textContent = formatCurrency(Math.round(revenueGain));
    gainTimeText.textContent = `${monthlyHoursReclaimed} hours`;
    gainMarginText.textContent = `+${marginIncreasePercent.toFixed(1)}%`;
  }

  if (salesSlider && hoursSlider) {
    salesSlider.addEventListener('input', updateCalculator);
    hoursSlider.addEventListener('input', updateCalculator);
    // Init on load
    updateCalculator();
  }

  // --- Testimonials Carousel ---
  const track = document.getElementById('testimonial-track');
  const slides = Array.from(track ? track.children : []);
  const nextButton = document.getElementById('next-testimonial');
  const prevButton = document.getElementById('prev-testimonial');
  const dotsContainer = document.getElementById('carousel-dots');
  const dots = Array.from(dotsContainer ? dotsContainer.children : []);

  let currentIndex = 0;
  let autoSlideTimer;

  function updateCarousel(index) {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    currentIndex = index;
    
    // Clamp/wrap boundaries
    if (currentIndex >= slides.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = slides.length - 1;

    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
  }

  if (nextButton && prevButton && dotsContainer) {
    nextButton.addEventListener('click', () => {
      resetTimer();
      updateCarousel(currentIndex + 1);
    });

    prevButton.addEventListener('click', () => {
      resetTimer();
      updateCarousel(currentIndex - 1);
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        resetTimer();
        updateCarousel(idx);
      });
    });

    function startTimer() {
      autoSlideTimer = setInterval(() => {
        updateCarousel(currentIndex + 1);
      }, 7000);
    }

    function resetTimer() {
      clearInterval(autoSlideTimer);
      startTimer();
    }

    startTimer();
  }

  // --- Reveal Animations on Scroll (Intersection Observer) ---
  const animateElements = document.querySelectorAll(
    '.feature-card, .step-card, .stat-card, .result-card, .calc-box, .comparison-table-wrapper'
  );

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    revealObserver.observe(el);
  });

  const style = document.createElement('style');
  style.innerHTML = `
    .revealed {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
});