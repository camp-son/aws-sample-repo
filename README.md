# Github와 AWS를 이용한 CICD 구성하기

# 개요
프론트엔드 개발을 하고 있지만 개발한 프로그램을 어떤식으로 빌드하고 배포할지에 대해서는 깊게 생각해보지 않았습니다. (~~내 영역이 아니니까 몰라도 되지 싶었지...~~)
주변에 연계되어 있는 기술들에 대해서는 무관심 했을지도 모릅니다. 그래서 이제 관심을 갖고자 제일 근접해 있는 인프라 영역에 대해 궁금해졌습니다. 현재 실무에 적용되어 있는 내용과 유사하고 대부분 알고 계시겠지만 구축되어 있다면 잘 보지 않는 CI/CD 파이프라인 구성을 준비해보았습니다!

# CICD 란?

## CI
`Continuous Integration` 지속적인 통합이라 하고 코드 레벨에서 이루어지는 내용을 의미합니다. 변경된 코드에 대해 빌드되고 테스트하여 공통 브랜치에 머지되는 것을 나타냅니다.

## CD
`Continuous Delivery` 또는 `Continuous Deployment` 지속적인 제공 또는 배포로 두가지 의미를 나타냅니다. 두 의미의 차이는 무엇이 있을까요? 
- `지속적인 제공` 배포하는 저장소에 새로운 코드가 반영되더라도 릴리즈 된 코드가 누군가의 승인을 통해 프로덕션 환경에 배포하는 것을 의미합니다.
- `지속적인 배포` 배포하는 저장소에 새로운 코드가 반영되면 릴리즈 된 코드를 프로덕션 환경으로 즉시 배포하는 것을 의미합니다.

차이점은 바로 `승인` 단계의 유무입니다. 이 승인 단계에 대해서는 뒤에 실습을 통해 확인해보도록 하겠습니다.

# 구성
실습에서는 `Github`와 `AWS`를 이용하여 코드를 수정하고 프로덕션 환경까지 배포하는 형태로 구성하였습니다. `master` 브랜치에 있는 코드를 배포하는 타겟으로 합니다.

- [x] `master`에는 직접 푸시를 못하고 PR을 통해서만 코드가 통합되도록 합니다.
    - Github 설정에 규칙을 추가할 수 있습니다.
- [x] PR이 생성되면 테스트 및 빌드를 실행하도록 합니다.
    - `npm ci` or `yarn --frozen-lockfile` 명령어를 이용하면 빠르고 안정적인 빌드를 할 수 있습니다.
    - [Compare npm ci command](https://github.com/zkat/node-package-manager-benchmark/tree/zkat/cipm)
    - [ ] Build는 React 앱을 배포할 때 추가
- [x] ~~PR이 머지되면 AWS에 배포되도록 합니다.~~
    - Github Actions를 통해 Build & Deploy 할 수 있지만, Codepipeline의 변경 감지 옵션을 통해 Build & Deploy를 실행할 수 있습니다.

# Github

## 브랜치 설정
특정 브랜치에 푸시를 하지 못하도록 하기 위해선 규칙을 생성해주어야 합니다.

1. `Settings` > `Branches` 에서 Rule을 생성합니다.
1. 브랜치명 패턴을 작성해줍니다. 현재는 `master` 브랜치만 규칙을 적용할거기 떄문에 `master` 를 입력해줍니다.
1. 아래 옵션을 체크해준다.
    - `Require a pull request before merging` 코드 병합은 PR이 필요한 옵션
    - `Include administrators` 관리자도 동일한 규칙을 따르는 옵션
    - 이렇게만 체크한다면 `master` 브랜치에는 직접 푸시를 할 수 없습니다.

## Actions
`workflow`를 생성하여 특정 Action에 동작할 수 있게 해줍니다. 통합과 배포를 분리하기 위해 `pr.yml` `deploy.yml` 로 분리하였습니다.

### on
해당 옵션에 `push` 또는 `pull_request` 을 감지할 수 있도록 할 수 있습니다.
`branches` `types` 등 여러 속성을 적용할 수 있습니다.

# AWS

## S3
빌드 또는 배포되는 파일들을 올려놓을 레파지토리를 별도로 생성해 줍니다.

## Codebuild
AWS의 Codebuild 제품에서 빌드를 생성합니다.

### 소스
- 소스 공급자를 Github를 선택합니다.
- Github 개인 엑세스 토큰을 연결합니다.
- 연결하고자 하는 레파지토리를 선택합니다.

### 환경
Docker 이미지를 사용하지 않기에, AWS에서 관리하는 이미지를 사용합니다.

- 운영체제, 런타임, 이미지, 이미지 버전을 선택합니다.
- 새 서비스 역할을 생성합니다.
- 추가 구성에서 리소스를 조금 사용하도록 컴퓨팅 4GB, vCPU 2개를 선택합니다.

### Buildspec
- 입력하지 않으면 루트에 있는 `buildspec.yml` 파일을 사용합니다.
    - 프로젝트 루트에 `buildspec.yml` 파일을 생성합니다.

### 아티팩트
Codedeploy를 사용할 때 만들어진 패키징 된 파일을 사용하여 배포하기 때문에 미리 설정을 해줍니다.

- 빌드 파일을 업로드할 AWS S3 제품에 들어가 생성해줍니다.
- 다시 빌드 생성으로 넘어와 생성한 S3를 연결해줍니다.

모두 설정했으면 빌드 프로젝트를 생성합니다.

## EC2
서비스를 배포할 가상 서버 인스턴스를 생성합니다.

### IAM 역할 추가
S3에 있는 파일을 읽어들이기 위하여 S3 읽기 전용 권한을 추가해줘야 합니다.

1. `IAM 접속 > 역할 > 역할 만들기` 역할 추가로 진입합니다.
1. `EC2` 선택 후 권한 설정으로 넘어갑니다.
1. `AmazonS3ReadOnlyAccess` 권한을 선택하고 다음으로 넘어갑니다.
1. 최종까지 넘어가 `역할 이름`을 입력하고 역할을 생성합니다.

### EC2 인스턴스 생성
1. `인스턴스 시작` 인스턴스 추가로 진입합니다.
1. 1단계: `Amazon linux 2` 를 선택합니다.
1. 2단계: 프리티어 유형을 선택합니다.(유료 사용자라면 원하는 그 무엇이든..) 
1. 3단계: 앞서 추가한 IAM 역할을 선택합니다.
1. 4, 5단계는 기본으로 적용합니다.
1. 6단계: 서비스를 위해선 http 프로토콜을 이용할 수 있도록 유형이 HTTP인 규칙을 추가해 줍니다.
1. 인스턴스를 검토 및 시작합니다.
1. 인스턴스의 태그에 인스턴스를 구분할 수 있도록 태그를 추가해줍니다.

### Codedeploy agent 설치
1. 시작된 EC2 인스턴스를 선택하고 `연결` 버튼을 누릅니다.
1. `EC2 인스턴스` 연결로 해당 인스턴스의 터미널로 연결합니다.
1. 아래 명령어를 입력하여 `codedeploy-agent` 서비스를 추가해줍니다.
    ```
    sudo yum update -y
    sudo yum install -y ruby wget
    wget https://aws-codedeploy-us-east-2.s3.us-east-2.amazonaws.com/latest/install
    chmod +x ./install
    sudo ./install auto
    sudo service codedeploy-agent status
    ```

## Codedeploy
코드 배포를 위해 배포와 배포 그룹을 생성합니다.

### 배포 애플리케이션 생성
1. 배포 애플리케이션을 생성 버튼을 클릭합니다.
1. 애플리케이션 이름을 입력하고 컴퓨팅 플랫폼은 `EC2/온프레미스` 를 선택하고 생성합니다.

### IAM 역할 추가
1. `IAM 접속 > 역할 > 역할 만들기` 역할 추가로 진입합니다.
1. `CodeDeploy` 선택 후 권한 설정으로 넘어갑니다.
1. 최종까지 넘어가 `역할 이름`을 입력하고 역할을 생성합니다.

### 배포 그룹 생성
1. 배포 애플리케이션 내에서 배포 그룹 생성으로 이동합니다.
1. 이름을 정하고 생성한 역할을 등록합니다.
1. `Amazon S3 인스턴스` 환경을 선택하고 배포할 인스턴스에 있는 태그로 선택합니다.
1. 로드 밸런서는 비활성화를 합니다.
1. 배포 그룹을 생성합니다.

### appspec.yml
appspec.yml을 생성하여 배포 프로세스에 맞게 shell 스크립트를 실행할 수 있습니다.

## Codepipeline
Codepipeline을 이용하여 build, deploy 과정을 한번에 생성할 수 있습니다.

### Pipeline 설정
1. Codepipeline을 새로 생성합니다.
1. 파이프라인에 대한 새로운 역할을 생성합니다.
1. 다음 단계로 이동합니다.

### Repository 설정
1. `Github 버전 2` 공급자를 선택합니다.
1. Github 연결을 통해 새앱을 만들고 [연결](https://docs.aws.amazon.com/ko_kr/codepipeline/latest/userguide/connections-github.html)합니다.
1. 연결된 앱에 있는 레파지토리, 브랜치를 선택합니다.
1. 다음 단계로 이동합니다.

### Build stage 설정
1. AWS Codebuild를 선택합니다.
1. 기존 서비스에 대한 빌드가 있다면 선택하고, 없다면 빌드를 새로 [생성](#codebuild)합니다.
1. 다음 단계로 이동합니다.

### Deploy stage 설정
1. AWS Codedeploy를 선택합니다.
1. 배포하고자 하는 배포를 선택합니다.
1. 배포 내에 그룹을 선택합니다.
1. 다음 단계로 이동합니다.

### Pipeline 생성
입력한 내용이 맞다면 파이프라인 생성을 합니다. 생성을 하면 생성된 파이프라인이 실행되면서 테스트를 확인해볼 수 있습니다.

# 활용

## CICD: Simple 
![Flow.drawio.png](https://github.com/camp-son/aws-sample-repo/blob/master/drawio/0-Flow.drawio.png?raw=true)

## CICD(Deployment): Development & Production environment
![Flow.drawio.png](https://github.com/camp-son/aws-sample-repo/blob/master/drawio/1-Flow.drawio.png?raw=true)

## CICD(Delivery): Development & Production environment
![Flow.drawio.png](https://github.com/camp-son/aws-sample-repo/blob/master/drawio/2-Flow.drawio.png?raw=true)
