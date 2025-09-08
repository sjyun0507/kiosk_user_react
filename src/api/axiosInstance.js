import axios from 'axios';

// 로컬: /api (Vite dev 서버 프록시), 배포: 절대 URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const instance = axios.create({
    baseURL,
    // withCredentials: false  // JWT 헤더 방식이면 보통 불필요
});

// (기존 토큰 인터셉터 유지)
export default instance;