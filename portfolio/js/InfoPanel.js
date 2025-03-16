// InfoPanel.js
export class InfoPanel {
  constructor() {
    // 바인딩
    this.showBuildingInfo = this.showBuildingInfo.bind(this);
    this.hideBuildingInfo = this.hideBuildingInfo.bind(this);

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

    // Start button event listener - 메모리 누수 방지를 위해 참조 저장
    const startBtn = document.getElementById('start-tour');
    this.startBtnHandler = () => {
      welcomePanel.classList.add('fade-out');
      setTimeout(() => {
        welcomePanel.style.display = 'none';
      }, 500);
    };
    startBtn.addEventListener('click', this.startBtnHandler);

    // 참조 저장
    this.welcomePanel = welcomePanel;
  }

  createBuildingInfoPanel() {
    // Create building info panel (now on the left side)
    this.buildingInfo = document.createElement('div');
    this.buildingInfo.classList.add('building-info', 'hidden', 'left-side-panel');
    this.buildingInfo.innerHTML = `
      <div class="close-btn">×</div>
      <div class="building-content"></div>
    `;
    document.body.appendChild(this.buildingInfo);

    // Get building content element
    this.buildingContent = this.buildingInfo.querySelector('.building-content');

    // Close button event listener
    const closeBtn = this.buildingInfo.querySelector('.close-btn');
    this.closeBtnHandler = this.hideBuildingInfo;
    closeBtn.addEventListener('click', this.closeBtnHandler);
  }

  showBuildingInfo(building) {
    if (this.selectedBuilding) {
      this.selectedBuilding.unhighlight();
    }

    this.selectedBuilding = building;
    building.highlight();

    // Set building info content with expanded details
    const info = building.info;

    // 콘텐츠 생성 최적화 - 캐싱된 콘텐츠 재사용
    const cacheKey = `info_${info.title}`;

    if (!this.contentCache) {
      this.contentCache = {};
    }

    // 캐시된 콘텐츠가 있으면 사용
    if (this.contentCache[cacheKey]) {
      this.buildingContent.innerHTML = this.contentCache[cacheKey];
    } else {
      // 확장된 설명 가져오기
      const extendedDescription = this.getExtendedDescription(info.title);

      // HTML 생성
      const content = `
        <h3>${info.title}</h3>
        <div class="info-divider"></div>
        <div class="info-section">
          <h4>Overview</h4>
          <p>${info.description}</p>
        </div>
        <div class="info-section">
          <h4>Experience & Expertise</h4>
          <p>${extendedDescription.experience}</p>
        </div>
        <div class="info-section">
          <h4>Projects</h4>
          <ul class="project-list">
            ${extendedDescription.projects.map(project => `
              <li>
                <div class="project-title">${project.title}</div>
                <div class="project-desc">${project.description}</div>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="info-section">
          <h4>Skills</h4>
          <div class="skills-container">
            ${extendedDescription.skills.map(skill => `
              <span class="skill-tag">${skill}</span>
            `).join('')}
          </div>
        </div>
      `;

      // 캐시에 저장
      this.contentCache[cacheKey] = content;

      // 내용 설정
      this.buildingContent.innerHTML = content;
    }

    // Show the building info panel
    this.buildingInfo.classList.remove('hidden');
    this.buildingInfo.style.display = "block";

    // Force reflow
    void this.buildingInfo.offsetWidth;

    this.buildingInfo.style.opacity = "1";
    this.buildingInfo.style.transform = "translateX(0)";
  }

  hideBuildingInfo() {
    if (this.selectedBuilding) {
      this.selectedBuilding.unhighlight();
      this.selectedBuilding = null;
    }

    this.buildingInfo.style.opacity = "0";
    this.buildingInfo.style.transform = "translateX(-20px)";

    setTimeout(() => {
      this.buildingInfo.style.display = "none";
      this.buildingInfo.classList.add('hidden');
    }, 300);
  }

  // 확장된 설명 생성 - 변경 없음
  getExtendedDescription(title) {
    // Default content
    let experience = "Over 7 years of experience in cloud architecture and infrastructure design.";
    let projects = [];
    let skills = ["Cloud Architecture", "Infrastructure as Code", "Containerization", "High Availability", "Disaster Recovery"];

    // 기존 로직 유지
    if (title.includes("AWS")) {
      experience = "8+ years of experience with AWS cloud infrastructure, specializing in scalable architectures and cost optimization strategies.";
      projects = [
        {
          title: "E-commerce Platform Migration",
          description: "Led migration of a high-traffic e-commerce platform to AWS, resulting in 40% cost reduction and 99.99% uptime."
        },
        {
          title: "Serverless Data Processing Pipeline",
          description: "Designed and implemented a serverless pipeline using Lambda, S3, and DynamoDB for real-time analytics processing."
        },
        {
          title: "Multi-Region Disaster Recovery Solution",
          description: "Implemented cross-region DR strategy using Route53, S3 replication, and automated failover mechanisms."
        }
      ];
      skills = ["EC2", "S3", "Lambda", "EKS", "CloudFormation", "DynamoDB", "VPC", "IAM", "RDS", "CloudFront"];
    }
    else if (title.includes("Kubernetes")) {
      experience = "6+ years of experience with Kubernetes orchestration, focusing on microservices architecture and CI/CD pipeline integration.";
      projects = [
        {
          title: "Microservices Platform Modernization",
          description: "Transformed monolithic application into 30+ microservices running on Kubernetes, improving deployment frequency from monthly to daily."
        },
        {
          title: "Multi-Cluster Federation Implementation",
          description: "Designed and deployed a federated Kubernetes environment spanning multiple cloud providers for redundancy and geographic distribution."
        },
        {
          title: "GitOps Workflow Implementation",
          description: "Established GitOps practices using ArgoCD and Flux, enabling declarative configuration and automated deployments."
        }
      ];
      skills = ["Kubernetes", "Docker", "Helm", "Istio", "Prometheus", "Grafana", "GitOps", "Service Mesh", "StatefulSets", "CRDs"];
    }
    else if (title.includes("NAVER")) {
      experience = "5+ years of experience with NAVER Cloud Platform, providing Korean-market focused cloud solutions with local regulatory compliance.";
      projects = [
        {
          title: "Financial Services Migration",
          description: "Migrated banking applications to NAVER Cloud while maintaining strict Korean financial regulatory compliance."
        },
        {
          title: "AI/ML Research Platform",
          description: "Built a research computing platform leveraging NAVER's AI and ML services for academic institutions."
        },
        {
          title: "Hybrid Cloud Architecture",
          description: "Designed hybrid infrastructure connecting on-premises systems with NAVER Cloud for a large Korean manufacturer."
        }
      ];
      skills = ["NAVER Cloud", "Object Storage", "VPC", "Load Balancer", "Cloud Functions", "Auto Scaling", "CDN", "Database", "Kubernetes Service"];
    }
    else if (title.includes("KT")) {
      experience = "4+ years specializing in KT Cloud solutions for enterprise and government sectors, with focus on secure and compliant architectures.";
      projects = [
        {
          title: "Government Agency Cloud Transformation",
          description: "Led migration of sensitive workloads to KT Cloud with enhanced security controls and compliance monitoring."
        },
        {
          title: "National Healthcare System Infrastructure",
          description: "Architected scalable, compliant infrastructure on KT Cloud for patient data management systems."
        },
        {
          title: "Telecommunications Data Platform",
          description: "Designed high-throughput data processing system for a major telecommunications provider using KT's dedicated solutions."
        }
      ];
      skills = ["KT Cloud", "IaaS", "PaaS", "Security Services", "VDI", "Dedicated Servers", "Bare Metal", "Storage Solutions", "Network Management"];
    }
    else if (title.includes("NHN")) {
      experience = "3+ years working with NHN Cloud infrastructure, specializing in gaming and high-traffic web application architectures.";
      projects = [
        {
          title: "Game Server Deployment Framework",
          description: "Created auto-scaling infrastructure for mobile game back-end servers supporting 500,000+ concurrent users."
        },
        {
          title: "Real-time Analytics Platform",
          description: "Implemented streaming data analytics solution for user behavior tracking and business intelligence."
        },
        {
          title: "CDN Optimization Project",
          description: "Redesigned content delivery architecture resulting in 65% latency reduction and improved user experience."
        }
      ];
      skills = ["NHN Cloud", "Compute", "Object Storage", "Load Balancing", "CDN", "Auto Scaling", "Database", "Monitoring", "Security"];
    }
    else {
      // Main building or default
      experience = "10+ years of experience in multi-cloud architecture design, implementation, and optimization across major public and private cloud platforms.";
      projects = [
        {
          title: "Enterprise Multi-Cloud Strategy",
          description: "Developed cloud adoption roadmap and reference architecture for Fortune 500 company spanning AWS, NAVER Cloud, and on-premises infrastructure."
        },
        {
          title: "Cloud Center of Excellence",
          description: "Established cloud governance framework and best practices for international organization with 5,000+ employees."
        },
        {
          title: "Cloud Cost Optimization Initiative",
          description: "Led initiative that reduced cloud spending by 35% while improving performance through architecture refinement and resource optimization."
        }
      ];
      skills = ["Multi-cloud Architecture", "AWS", "NAVER Cloud", "KT Cloud", "NHN Cloud", "Kubernetes", "Terraform", "Ansible", "CI/CD", "Site Reliability Engineering"];
    }

    return {
      experience,
      projects,
      skills
    };
  }

  // 리소스 정리
  dispose() {
    // 이벤트 리스너 정리
    if (this.startBtnHandler) {
      const startBtn = document.getElementById('start-tour');
      if (startBtn) {
        startBtn.removeEventListener('click', this.startBtnHandler);
      }
    }

    if (this.closeBtnHandler) {
      const closeBtn = this.buildingInfo.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.removeEventListener('click', this.closeBtnHandler);
      }
    }

    // DOM 요소 제거
    if (this.welcomePanel && this.welcomePanel.parentNode) {
      this.welcomePanel.parentNode.removeChild(this.welcomePanel);
    }

    if (this.buildingInfo && this.buildingInfo.parentNode) {
      this.buildingInfo.parentNode.removeChild(this.buildingInfo);
    }

    // 참조 정리
    this.welcomePanel = null;
    this.buildingInfo = null;
    this.buildingContent = null;
    this.selectedBuilding = null;
    this.contentCache = null;
  }
}