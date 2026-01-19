/**
 * Pasahitzen RSA zifratzerako erabilgarritasuna
 * Gako publikoarekin zifraketa inplementatzen du kredentzialak modu seguruan bidaltzeko
 */

export class CryptoUtil {
  /**
   * RSA gako pare bat sortzen du (publikoa/pribatua)
   * Produkzioan, gako pribatua zerbitzarian bakarrik egon behar da
   */
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Gako publikoa PEM formatuan esportatzen du
   */
  static async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)));
    const exportedAsBase64 = window.btoa(exportedAsString);
    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
  }

  /**
   * Gako publikoa PEM formatutik inportatzen du
   */
  static async importPublicKey(pem: string): Promise<CryptoKey> {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem.substring(
      pemHeader.length,
      pem.length - pemFooter.length
    ).trim();
    
    const binaryDerString = window.atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  /**
   * Testu arrunta gako publikoarekin zifratzen du
   * @param publicKey Zifratzeko gako publikoa
   * @param plaintext Zifratu beharreko testua (adib: pasahitza)
   * @returns Base64-n zifratutako testua
   */
  static async encryptWithPublicKey(publicKey: CryptoKey, plaintext: string): Promise<string> {
    const encoded = new TextEncoder().encode(plaintext);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /**
   * Testu baten SHA-256 hash-a sortzen du
   * Balidazio gehigarrietarako erabilgarria
   */
  static async hashSHA256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
