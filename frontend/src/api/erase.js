const CLEANUP_URL = "/api/cleanup"

export function erase(){
    return fetch(`${CLEANUP_URL}/erase`, {
        method:"POST",
    });
}
