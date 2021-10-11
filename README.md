# aws-sample-repo

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
- [x] PR이 생성되면 테스트 및 빌드를 실행하도록 합니다.(Build는 React에 적용할 때 추가)
    - `npm ci` or `yarn --frozen-lockfile` 명령어를 이용하면 빠르고 안정적인 빌드를 할 수 있습니다.
- [ ] PR이 머지되면 AWS에 배포되도록 합니다.(단계적으로 갑시다.)

# Github

## 브랜치 설정

1. `Settings` > `Branches` 에서 Rule을 생성합니다.



# 참조
- [Compare npm ci command](https://github.com/zkat/node-package-manager-benchmark/tree/zkat/cipm)
