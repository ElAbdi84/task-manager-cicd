# 🚀 Task Manager - Projet CI/CD AWS Full Stack

[![AWS](https://img.shields.io/badge/AWS-CloudFormation-orange)](https://aws.amazon.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com/features/actions)
[![React](https://img.shields.io/badge/Frontend-React-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1)](https://www.mysql.com/)

## 📋 Description du Projet

Application web de gestion de tâches (Task Manager) déployée sur AWS avec une architecture cloud complète, démontrant les compétences en :
- **Infrastructure as Code** (CloudFormation)
- **CI/CD Pipeline** (GitHub Actions)
- **Architecture Cloud** (EC2, VPC, S3, CloudWatch)
- **Développement Full Stack** (React + Node.js + MySQL)

---

## 🏗️ Architecture AWS

### Schéma d'Architecture

```
                    Internet
                       |
                       v
              [Internet Gateway]
                       |
        +--------------+---------------+
        |                              |
        v                              v
  [Public Subnet]              [NAT Gateway]
        |                              |
  [Frontend EC2]                       v
   - React App                 [Private Subnet]
   - Nginx                            |
   - 3.237.74.1                       |
                               [Backend EC2]
                                - Node.js API
                                - MySQL
                                - 10.0.X.X
```

### Composants de l'Infrastructure

| Composant | Description | Configuration |
|-----------|-------------|---------------|
| **VPC** | Réseau virtuel isolé | CIDR: 10.0.0.0/16 |
| **Public Subnet** | Sous-réseau accessible depuis Internet | 10.0.1.0/24 |
| **Private Subnet** | Sous-réseau isolé (backend) | 10.0.2.0/24 |
| **Internet Gateway** | Accès Internet pour le subnet public | - |
| **NAT Gateway** | Sortie Internet pour le subnet privé | - |
| **Frontend EC2** | Instance publique (t3.micro) | Amazon Linux 2023 |
| **Backend EC2** | Instance privée (t3.micro) | Amazon Linux 2023 |
| **CloudWatch** | Monitoring et logs | Alarmes CPU/Status |
| **SNS** | Notifications par email | Alertes automatiques |

---

## 💻 Stack Technique

### Frontend
- **Framework** : React 18
- **Styling** : CSS3 (Gradient design)
- **Server** : Nginx 1.24
- **Runtime** : Node.js 20

### Backend
- **Framework** : Express.js 4.18
- **Runtime** : Node.js 20
- **Process Manager** : PM2
- **Database** : MariaDB 10.5 (MySQL)

### DevOps
- **IaC** : AWS CloudFormation
- **CI/CD** : GitHub Actions
- **Monitoring** : CloudWatch + SNS
- **Version Control** : Git + GitHub

---

## 📁 Structure du Projet

```
task-manager-cicd/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Tests automatisés
│       └── deploy.yml                # Déploiement automatique
│
├── cloudformation/
│   ├── 1-vpc-network.yml            # VPC, Subnets, IGW, NAT
│   ├── 2-security-groups.yml        # Security Groups
│   ├── 3-iam-roles.yml              # IAM Roles & Policies
│   ├── 4-compute.yml                # EC2 Instances
│   └── 5-monitoring.yml             # CloudWatch & SNS
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js                   # Application React
│   │   ├── App.css                  # Styles
│   │   └── index.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   └── package.json
│   └── (Code créé par UserData) dans cloudformation
│
├── database/
│   └── init.sql                     # Schéma base de données
│
├── scripts/
│  
│
└── README.md
```

---

## 🚀 Démarrage Rapide

### Prérequis

- **Compte AWS** avec accès administrateur
- **AWS CLI** configuré (`aws configure`)
- **Node.js 20+** installé
- **Git** installé
- **Compte GitHub**

### Installation en 5 Étapes

#### 1️⃣ Cloner le Projet

```bash
git clone https://github.com/ElAbdi84/task-manager-cicd.git
cd task-manager-cicd
```

#### 2️⃣ Créer la KeyPair AWS

```bash
aws ec2 create-key-pair \
  --key-name task-manager-key \
  --region us-east-1 \
  --query 'KeyMaterial' \
  --output text > task-manager-key.pem

chmod 400 task-manager-key.pem
```

#### 3️⃣ Déployer l'Infrastructure avec   AWS CLs

```bash
# Obtenir votre IP
MY_IP=$(curl -s https://ifconfig.me)



```bash
# Stack 1: VPC
aws cloudformation create-stack \
  --stack-name TaskManager-network \
  --template-body file://cloudformation/1-vpc-network.yml \
  --region us-east-1

# Stack 2: Security Groups
aws cloudformation create-stack \
  --stack-name TaskManager-security \
  --template-body file://cloudformation/2-security-groups.yml \
  --parameters ParameterKey=IPAddress,ParameterValue=${MY_IP}/32 \
  --region us-east-1

# Stack 3: IAM Roles
aws cloudformation create-stack \
  --stack-name TaskManager-iam \
  --template-body file://cloudformation/3-iam-roles.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Stack 4: EC2 Instances
aws cloudformation create-stack \
  --stack-name TaskManager-compute \
  --template-body file://cloudformation/4-compute.yml \
  --parameters \
    ParameterKey=KeyName,ParameterValue=task-manager-key \
    ParameterKey=DBPassword,ParameterValue=TaskManager2025! \
  --region us-east-1

# Stack 5: Monitoring
aws cloudformation create-stack \
  --stack-name TaskManager-monitoring \
  --template-body file://cloudformation/5-monitoring.yml \
  --parameters ParameterKey=AlertEmail,ParameterValue=votre.email@example.com \
  --region us-east-1
```

#### 4️⃣ Configurer GitHub Actions

1. Aller dans **Settings** > **Secrets and variables** > **Actions**
2. Ajouter les secrets :

```
AWS_ACCESS_KEY_ID          = Votre clé AWS
AWS_SECRET_ACCESS_KEY      = Votre secret AWS
AWS_REGION                 = us-east-1
EC2_SSH_PRIVATE_KEY_B64    = Clé SSH encodée en base64
```

**Encoder la clé SSH :**

```bash
base64 task-manager-key.pem | tr -d '\n' > key-base64.txt
cat key-base64.txt
# Copier et coller dans GitHub Secret
```

#### 5️⃣ Déployer l'Application

```bash
# Créer une branche de développement
git checkout -b dev

# Faire des modifications
# ...

# Commit et push
git add .
git commit -m "Add new feature"
git push origin dev

# Créer une Pull Request sur GitHub
# Dev → Main

# Merger la PR
# Le pipeline CI/CD se déclenche automatiquement !
```

---

## 🔄 Pipeline CI/CD

### Workflow CI (Tests)

**Déclenché sur :** Push vers `main` ou `dev`, Pull Requests

**Étapes :**
1. ✅ Validation des templates CloudFormation
2. ✅ Build du frontend React
3. ✅ Vérification de la structure du projet

### Workflow CD (Déploiement)

**Déclenché sur :** Push vers `main`

**Étapes :**
1. 📦 Build de l'application React
2. 🔑 Configuration SSH
3. 📤 Upload vers EC2 Frontend
4. 🔄 Rechargement Nginx
5. ✅ Vérification du déploiement

**Timeline :**
```
T+0s    Push vers main
T+30s   Tests CI passés
T+1m    Build React
T+2m    Upload vers EC2
T+3m    Application déployée ✅
```

---

## 📊 Monitoring

### CloudWatch Dashboards

Accéder à : `CloudWatch Console > Dashboards > TaskManager-Dashboard`

**Métriques surveillées :**
- CPU Utilization (Frontend & Backend)
- Memory Usage
- Status Checks
- Nginx Access/Error Logs

### Alarmes SNS

**Alertes configurées :**

| Alarme | Condition | Action |
|--------|-----------|--------|
| CPU élevé | > 70% pendant 10 min | Email SNS |
| Instance DOWN | Status check failed | Email SNS |
| Memory haute | > 80% | Email SNS |

**Confirmer les alertes :**
1. Vérifier votre email après le déploiement
2. Cliquer sur "Confirm subscription"

---

## 🧪 Tests et Vérifications

### Tester l'Application

```bash
# Obtenir l'IP publique
FRONTEND_IP=$(aws cloudformation describe-stacks \
  --stack-name TaskManager-compute \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendPublicIP`].OutputValue' \
  --output text)

# Tester le frontend
curl http://$FRONTEND_IP

# Tester l'API
curl http://$FRONTEND_IP/api/health
curl http://$FRONTEND_IP/api/tasks

# Ouvrir dans le navigateur
echo "http://$FRONTEND_IP"
```

### SSH vers les Instances

```bash
# Frontend (public)
ssh -i task-manager-key.pem ec2-user@$FRONTEND_IP

# Backend (via jump host)
BACKEND_IP=$(aws cloudformation describe-stacks \
  --stack-name TaskManager-compute \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`BackendPrivateIP`].OutputValue' \
  --output text)

ssh -i task-manager-key.pem \
  -J ec2-user@$FRONTEND_IP \
  ec2-user@$BACKEND_IP
```

### Vérifier les Logs

```bash
# Logs CloudWatch
aws logs tail /aws/ec2/taskmanager/frontend --follow

# Logs Nginx (SSH vers frontend)
sudo tail -f /var/log/nginx/access.log

# Logs Backend (SSH vers backend)
pm2 logs taskmanager-backend
```

---



## 🧹 Nettoyage (Supprimer tout)

```bash
# Option 1 : Script automatique
./scripts/cleanup.sh

# Option 2 : Manuel
aws cloudformation delete-stack --stack-name TaskManager-monitoring
aws cloudformation delete-stack --stack-name TaskManager-compute
aws cloudformation delete-stack --stack-name TaskManager-iam
aws cloudformation delete-stack --stack-name TaskManager-security
aws cloudformation delete-stack --stack-name TaskManager-network

# Supprimer la KeyPair
aws ec2 delete-key-pair --key-name task-manager-key
rm task-manager-key.pem
```

---

## 🐛 Dépannage

### Problème : L'application ne charge pas

```bash
# Vérifier le statut des instances
aws ec2 describe-instance-status

# Vérifier Nginx
ssh -i task-manager-key.pem ec2-user@$FRONTEND_IP
sudo systemctl status nginx
sudo nginx -t
```

### Problème : L'API ne répond pas

```bash
# SSH vers le backend
ssh -i task-manager-key.pem -J ec2-user@$FRONTEND_IP ec2-user@$BACKEND_IP

# Vérifier PM2
pm2 status
pm2 logs

# Vérifier MySQL
mysql -u taskuser -pTaskManager2025! -e "SHOW DATABASES;"
```

### Problème : Pipeline GitHub Actions échoue

```bash
# Vérifier les secrets GitHub
# Settings > Secrets > Actions

# Re-générer la clé SSH encodée
base64 task-manager-key.pem | tr -d '\n'
```

---

## 📚 Documentation Additionnelle

- [AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [React Documentation](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

---

## 🎓 Compétences Démontrées

### AWS
- ✅ CloudFormation (Infrastructure as Code)
- ✅ EC2 (Compute)
- ✅ VPC (Networking)
- ✅ Security Groups
- ✅ IAM Roles
- ✅ CloudWatch (Monitoring)
- ✅ SNS (Notifications)

### DevOps
- ✅ CI/CD Pipeline (GitHub Actions)
- ✅ Automated Testing
- ✅ Automated Deployment
- ✅ Infrastructure as Code

### Développement
- ✅ React (Frontend)
- ✅ Node.js/Express (Backend)
- ✅ MySQL (Database)
- ✅ REST API
- ✅ Git/GitHub

---

## 👨‍💻 Auteur

**EL ABDI OUMAYMA**

- **Projet** : AWS CI/CD Task Manager
- **Date** : Novembre 2025
- **GitHub** : [@ElAbdi84](https://github.com/ElAbdi84)

---

## 📝 Licence

Ce projet est à usage éducatif.

---

## 🙏 Remerciements

- Formation DevOps AWS
- Documentation AWS
- Communauté GitHub Actions
