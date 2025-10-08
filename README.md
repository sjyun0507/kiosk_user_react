# Cafe Kiosk

실제 매장 키오스크 사용 경험을 반영하여 구현한 React 기반의 **카페 키오스크 웹 애플리케이션**입니다.프론트엔드와 백엔드를 분리하여 API 기반의 통신 구조를 설계하였고, 키오스크와 관리자는 별도로 분리하여 프로젝트를 만들었습니다. 해당 Repo는 키오스크 프론트앤드 프로젝트로, 사용자는 직관적인 UI를 통해 실제 매장 키오스크처럼 메뉴를 선택하고 옵션을 설정한 뒤, 결제까지 진행할 수 있습니다.  

---

## 데모 (Live Demo)
👉 [Beans Coffee 바로가기](http://175.45.200.254:8080/)

---

## 프로젝트 개요

- 프로젝트명 : BEANS COFFEE KIOSK
- 키오스크 개발인원 : 2명
- 프로젝트 기간: 2025.07.25 ~ 2025.08.02 (9일)
- 개발 목적 : 실제 카페 키오스크 UX 분석 및 기능 구현을 통한 풀스택 개발 역량 강화
- 특징 : 실제 매장에서 사용되는 키오스크 UI를 참고하여, 사용자 친화적인 인터페이스를 구현했습니다.	장바구니 기능과 옵션별 가격 계산 로직을 서버에서 처리하여 정확한 결제 금액을 계산할 수 있도록 설계했습니다.주문 요청 시 프론트엔드에서 DTO를 통해 백엔드로 전달, DB에 저장되며 관리자 페이지에서 확인 가능하도록 구현했습니다.

---

## 역할 분담

| 이름 | 담당 역할 |
|------|------------|
| Rachel (Seojeong Yun) | 풀스택, UI 설계, 결제 기능 연동 |
| seolhyeono | 백엔드, DB 설계, API 개발 |

---

## Tech Stack

- **Frontend**: React, Vite, JavaScript, Tailwind CSS
- **Backend**: Java, Spring Boot
- **Database**: MariaDB
- **ORM**: JPA 
- **Tools**: Git, GitHub, Notion, Swagger, Filezilla, Termius
- **Deployment***: NeverCloud

---
## 주요 기능 화면

### 초기 화면
<figure align="center">
  <img width="1000" alt="초기 화면" src="https://github.com/user-attachments/assets/435f02c8-52c1-4935-89e4-a89415eb4fba" />
  <figcaption>버튼 클릭 시 메인 키오스크로 진입</figcaption>
</figure>

### 메인 키오스크 화면

<table>
  <tr>
    <td width="50%" valign="top">
      <b>메뉴 조회 및 선택</b><br/>
      <sub>카테고리/메뉴 탐색, 상세 진입</sub><br/><br/>
      <img alt="키오스크" src="https://github.com/user-attachments/assets/3953ef4f-9607-4c4f-8f5d-971b5c64226d" width="100%"/>
    </td>
    <td width="50%" valign="top">
      <b>옵션 선택 & 장바구니 담기</b><br/>
      <sub>사이즈/샷추가/얼음량 등 커스터마이징</sub><br/><br/>
      <img alt="커피 옵션" src="https://github.com/user-attachments/assets/c4def2e6-9d7d-4a3a-ad5e-f7853e03ff6d" width="100%"/>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>음료별 옵션 분기</b><br/>
      <sub>커피 · 버블티 · 스무디 · 에이드별 옵션 동적 노출</sub><br/><br/>
      <img alt="옵션 분기" src="https://github.com/user-attachments/assets/c6e55d57-7986-4099-a517-829b40eac446" width="100%"/>
    </td>
    <td width="50%" valign="top">
      <b>신메뉴 & 재고 기반 장바구니</b><br/>
      <sub>관리자 등록 30일 이내 → 신메뉴 배지 / 수량 변경·삭제 / 품절 제한</sub><br/><br/>
      <img alt="신메뉴/장바구니" src="https://github.com/user-attachments/assets/d95640bc-4a88-484b-ab15-dc4b070b6e12" width="100%"/>
    </td>
  </tr>
</table>

### 주문 및 결제

<table>
  <tr>
    <td width="50%" valign="top">
      <b>포인트 적립/사용</b><br/>
      <sub>휴대폰 번호 인증으로 멤버십 적립/차감</sub><br/><br/>
      <img alt="포인트" src="https://github.com/user-attachments/assets/b561c492-8a17-405d-b48c-b109d309553a" width="100%"/>
    </td>
    <td width="50%" valign="top">
      <b>결제</b><br/>
      <sub>토스 결제 연동</sub><br/><br/>
      <img alt="결제" src="https://github.com/user-attachments/assets/ac21b582-1439-4e84-a985-367c4b3b28e6" width="100%"/>
    </td>
  </tr>
</table>

---

## 기능 시연
<p>직관적인 UI와 실제 키오스크 동작을 모방한 커피 주문 웹앱입니다. 반응형 UI 적용으로 다양한 디바이스 대응가능합니다.</p>

![cafe Kiosk](https://github.com/user-attachments/assets/d67d104d-82b1-4a33-8009-1868ddc295f8)

---

## 프로젝트 회고

- React와 Spring Boot를 활용한 풀스택 개발 경험을 통해 프론트엔드 컴포넌트 구조화, 백엔드 API 설계, DB 연동까지 전반적인 개발 흐름을 익혔습니다.
- 장바구니, 옵션 선택, 주문 금액 계산 등 실서비스에 가까운 기능들을 구현하며 프론트-백엔드 간 데이터 처리 방식과 역할 분리의 중요성을 체감했습니다.
- API 통신 오류, DTO 설계 미흡, 옵션 처리 로직 등에서 시행착오를 겪으며 문제 해결 역량을 키울 수 있었습니다.
- Git 브랜치 전략을 바탕으로 팀 협업 상황을 가정한 개발 프로세스를 구성했고, 실무에서도 적용 가능한 워크플로우를 연습했습니다.
- 특히 이번 프로젝트를 통해 DB 설계의 중요성을 깊이 체감했으며, 엔티티 간 관계 정의와 테이블 구조가 전체 시스템의 안정성과 유지보수성에 큰 영향을 준다는 점을 배웠습니다.

<br/>

---

## Backend Repository
<a href="https://github.com/sjyun0507/kiosk_user.git" target="_blank">
  <img src="https://img.shields.io/badge/-%20Go%20to%20Backend%20Repo-000000?style=for-the-badge&logo=react&logoColor=white" />
</a>


