// InfoPanel.js
export class InfoPanel {
  constructor() {
    // Create welcome panel
    this.createWelcomePanel();

    // Create building info panel
    this.createBuildingInfoPanel();

    // Current selected building
    this.selectedBuilding = null;
  }

  createWelcomePanel() {
    // Create welcome panel
    const welcomePanel = document.createElement('div');
    welcomePanel.classList.add('welcome-panel');
    welcomePanel.innerHTML = `
      <div class="welcome-content">
        <h1>KSJ's Portfolio</h1>
        <h2>Cloud Solutions Architect</h2>
        <p>Welcome to my interactive portfolio city! Each building represents different technologies I work with.</p>
        <p>Explore the 3D city and click on buildings to learn about my expertise in various cloud technologies.</p>
        <button id="start-tour" class="primary-btn">Start Exploring</button>
      </div>
    `;
    document.body.appendChild(welcomePanel);

    // Start button event listener
    const startBtn = document.getElementById('start-tour');
    startBtn.addEventListener('click', () => {
      welcomePanel.classList.add('fade-out');
      setTimeout(() => {
        welcomePanel.style.display = 'none';
      }, 500);
    });
  }

  createBuildingInfoPanel() {
    // Create building info panel
    this.buildingInfo = document.createElement('div');
    this.buildingInfo.classList.add('building-info', 'hidden');
    this.buildingInfo.innerHTML = `
      <div class="close-btn">×</div>
      <div class="building-content"></div>
    `;
    document.body.appendChild(this.buildingInfo);

    // Get building content element
    this.buildingContent = this.buildingInfo.querySelector('.building-content');

    // Close button event listener
    const closeBtn = this.buildingInfo.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      this.hideBuildingInfo();
    });
  }

  showBuildingInfo(building) {
    if (this.selectedBuilding) {
      this.selectedBuilding.unhighlight();
    }

    this.selectedBuilding = building;
    building.highlight();

    // Set building info content
    const info = building.info;
    this.buildingContent.innerHTML = `
      <h4>${info.title}</h4>
      <p>${info.description}</p>
    `;

    // Show the building info panel
    this.buildingInfo.classList.remove('hidden');
    this.buildingInfo.style.display = "block";

    // Force reflow
    void this.buildingInfo.offsetWidth;

    this.buildingInfo.style.opacity = "1";
    this.buildingInfo.style.transform = "translateY(0)";
  }

  hideBuildingInfo() {
    if (this.selectedBuilding) {
      this.selectedBuilding.unhighlight();
      this.selectedBuilding = null;
    }

    this.buildingInfo.style.opacity = "0";
    this.buildingInfo.style.transform = "translateY(20px)";

    setTimeout(() => {
      this.buildingInfo.style.display = "none";
      this.buildingInfo.classList.add('hidden');
    }, 300);
  }
}