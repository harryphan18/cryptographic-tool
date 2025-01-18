import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import * as paillier from 'paillier-bigint';
import diffieHellman from 'diffie-hellman';
import { Button, Col, Input, Row, message } from 'antd';

const CryptoTool = () => {
    const [cbc, setCbc] = useState({ plaintext: '', key: '', iv: '', ciphertext: '' });
    const [gcm, setGcm] = useState({ plaintext: '', key: '', iv: '', tag: '', ciphertext: '' });
    const [dh, setDh] = useState({ p: '', g: '', privateKey: '', publicKey: '', sharedKey: '' });
    const [paillierState, setPaillierState] = useState({ publicKey: null, privateKey: null, plaintext: '', ciphertext: '' });

    const [messageApi, contextHolder] = message.useMessage();

    function randomBytes(size) {
        return CryptoJS.lib.WordArray.random(size).toString(CryptoJS.enc.Hex);
    }

    // CBC Encryption
    const handleCbcEncrypt = () => {
        const key = randomBytes(16);
        const iv = randomBytes(16);
        const ciphertext = CryptoJS.AES.encrypt(cbc.plaintext, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC
        });
        setCbc({ ...cbc, key: key, iv: iv, ciphertext: ciphertext.toString() });
    };

    const handleCbcDecrypt = () => {
        const key = cbc.key;
        const iv = cbc.iv;
        const ciphertext = cbc.ciphertext;
        const plaintext = CryptoJS.AES.decrypt(ciphertext, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC
        });
        setCbc({ ...cbc, plaintext: plaintext.toString() });
    };

    // GCM Encryption
    const handleGcmEncrypt = () => {
        const key = randomBytes(32); // Tạo khóa ngẫu nhiên 256-bit
        const iv = randomBytes(12); // Tạo IV ngẫu nhiên 96-bit
        const cipher = CryptoJS.AES.encrypt(gcm.plaintext, key, {
            iv: iv,
            mode: CryptoJS.mode.GCM,
            format: CryptoJS.format.Hex
        });
        const tag = cipher.ciphertext.toString(CryptoJS.enc.Hex).slice(-32);
        const ciphertext = cipher.toString() + tag; // Kết hợp ciphertext và tag
        setGcm({ ...gcm, key: key, iv: iv, tag: tag, ciphertext: ciphertext});
    };

    const handleGcmDecrypt = () => {
        const ciphertext = gcm.ciphertext;
        const tag = ciphertext.slice(-32); // Tách tag từ ciphertext
        const encrypted = ciphertext.slice(0, -32); // Tách ciphertext
        const decrypted = CryptoJS.AES.decrypt(encrypted, gcm.key, {
            iv: gcm.iv,
            mode: CryptoJS.mode.GCM,
            format: CryptoJS.format.Hex,
            tag: CryptoJS.enc.Hex.parse(tag) // Sử dụng tag để giải mã
        });
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        setGcm({ ...gcm, plaintext: plaintext });
    };

    // Diffie-Hellman Key Exchange
    const handleDhGenerateKey = () => {
        const dhInstance = diffieHellman.createDiffieHellman(dh.p, dh.g);
        const privateKey = dhInstance.generateKeys();
        const publicKey = dhInstance.getPublicKey('hex');

        setDh({ ...dh, privateKey: privateKey.toString('hex'), publicKey });
    };

    const handleDhComputeKey = () => {
        const dhInstance = diffieHellman.createDiffieHellman(dh.p, dh.g);
        dhInstance.setPrivateKey(Buffer.from(dh.privateKey, 'hex'));
        const sharedKey = dhInstance.computeSecret(Buffer.from(dh.publicKey, 'hex'), 'hex');
        setDh({ ...dh, sharedKey });
    };

    // Paillier Cryptosystem
    const handlePaillierKeygen = async () => {
        const { publicKey, privateKey } = await paillier.generateRandomKeys(512);
        setPaillierState({ ...paillierState, publicKey, privateKey });
        messageApi.open({
            type: 'success',
            content: 'Keys generated!',
        });
    };

    const handlePaillierEncrypt = () => {
        if (!paillierState.publicKey) {
            messageApi.open({
                type: 'warning',
                content: 'PublicKey not generated!',
            });
            return;
        }
        const plaintext = Number(paillierState.plaintext);
        const ciphertext = paillierState.publicKey.encrypt(plaintext);
        setPaillierState({ ...paillierState, ciphertext: ciphertext.toString() });
    };

    const handlePaillierDecrypt = () => {
        if (!paillierState.privateKey) {
            messageApi.open({
                type: 'warning',
                content: 'PrivateKey not generated!',
            });
            return;
        }
        const ciphertext = Number(paillierState.ciphertext);
        const plaintext = paillierState.privateKey.decrypt(ciphertext);
        setPaillierState({ ...paillierState, plaintext: plaintext.toString() });
    };

    return (
    <>
        {contextHolder}
        <h1>Cryptography Tool</h1>

        <div className='form-control'>
            <Input value={cbc.plaintext}
                placeholder='Plaintext'
                onChange={(e) => setCbc({ ...cbc, plaintext: e.target.value })}
            />
            <Row className='text-result'>
                <Button color='cyan' variant='solid' className='btn'
                    onClick={handleCbcEncrypt}
                >Encrypt</Button>
                <Button color='cyan' variant='outlined' className='btn'
                    onClick={handleCbcDecrypt}
                >Decrypt</Button>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Ciphertext:</Col>
                <Col span={14} className='value'>{cbc.ciphertext}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Key:</Col>
                <Col span={14} className='value'>{cbc.key}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>IV:</Col>
                <Col span={14} className='value'>{cbc.iv}</Col>
            </Row>
        </div>



        <h2>GCM</h2>

        <div className='form-control'>
            <Input value={gcm.plaintext}
                placeholder='Plaintext'
                onChange={(e) => setGcm({ ...gcm, plaintext: e.target.value })}
            />
            <Row className='text-result'>
                <Button color='cyan' variant='solid' className='btn'
                    onClick={handleGcmEncrypt}
                >Encrypt</Button>
                <Button color='cyan' variant='outlined' className='btn'
                    onClick={handleGcmDecrypt}
                >Decrypt</Button>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Ciphertext:</Col>
                <Col span={14} className='value'>{gcm.ciphertext}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Key:</Col>
                <Col span={14} className='value'>{gcm.key}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>IV:</Col>
                <Col span={14} className='value'>{gcm.iv}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Tag:</Col>
                <Col span={14} className='value'>{gcm.tag}</Col>
            </Row>
        </div>



        <h2>Diffie-Hellman</h2>

        <div className='form-control'>
            <Row className='text-result'>
                <Col span={10}>
                    <Input value={dh.p}
                        placeholder='Số nguyên tố P'
                        onChange={(e) => setDh({ ...dh, p: e.target.value })}
                    />
                </Col>
                <Col span={10}>
                    <Input value={dh.g}
                        placeholder='Số nguyên tố G'
                        onChange={(e) => setDh({ ...dh, g: e.target.value })}
                    />
                </Col>
            </Row>
            <Row className='text-result'>
                <Button color='cyan' variant='solid' className='btn'
                    onClick={handleDhGenerateKey}
                >Generate Public Key</Button>
                <Button color='cyan' variant='outlined' className='btn'
                    onClick={handleDhComputeKey}
                >Compute Shared Key</Button>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Public Key:</Col>
                <Col span={14} className='value'>{dh.publicKey}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Shared Key:</Col>
                <Col span={14} className='value'>{dh.sharedKey}</Col>
            </Row>
        </div>




        <h2>Paillier</h2>

        <div className='form-control'>
            <Input value={gcm.plaintext}
                placeholder='Plaintext'
                onChange={(e) => setGcm({ ...gcm, plaintext: e.target.value })}
            />
            <Row className='text-result'>
                <Button color='cyan' variant='filled' className='btn'
                    onClick={handlePaillierKeygen}
                >Generate Keys</Button>
                <Button color='cyan' variant='solid' className='btn'
                    onClick={handlePaillierEncrypt}
                >Encrypt</Button>
                <Button color='cyan' variant='outlined' className='btn'
                    onClick={handlePaillierDecrypt}
                >Decrypt</Button>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Plaintext:</Col>
                <Col span={14} className='value'>{paillierState.plaintext}</Col>
            </Row>
            <Row className='text-result'>
                <Col span={10} className='label'>Ciphertext:</Col>
                <Col span={14} className='value'>{paillierState.ciphertext}</Col>
            </Row>
        </div>
    </>
    )
}

export default CryptoTool;