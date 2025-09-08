(function () {
    if (typeof globalThis.crypto !== 'object') {
        globalThis.crypto = {};
    }
    if (typeof globalThis.crypto.randomUUID !== 'function') {
        function fallbackUUID() {
            const getBytes = () => {
                if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
                    return globalThis.crypto.getRandomValues(new Uint8Array(16));
                }
                // 완전 폴백
                return Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
            };
            const bytes = getBytes();
            // RFC4122 v4
            bytes[6] = (bytes[6] & 0x0f) | 0x40;
            bytes[8] = (bytes[8] & 0x3f) | 0x80;
            const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
            return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
        }
        globalThis.crypto.randomUUID = fallbackUUID;
    }
})();