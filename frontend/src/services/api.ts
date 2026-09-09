import { DocumentItem, DocumentSummary, StudyQuestion, QuizQuestion, ChatMessage, User } from '../types';

// Default FastAPI Base URL from Vite env, fallback to http://127.0.0.1:8000
const DEFAULT_API_BASE_URL =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Base URL for FastAPI backend (configurable via UI or localStorage)
let currentBaseUrl =
  typeof window !== 'undefined'
    ? (localStorage.getItem('companion_api_base_url') || DEFAULT_API_BASE_URL)
    : DEFAULT_API_BASE_URL;

export const getApiBaseUrl = (): string => currentBaseUrl;
export const setApiBaseUrl = (url: string): void => {
  currentBaseUrl = url.replace(/\/+$/, ''); // trim trailing slash
  if (typeof window !== 'undefined') {
    localStorage.setItem('companion_api_base_url', currentBaseUrl);
  }
};

// JWT token storage helpers
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('companion_jwt_token');
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('companion_jwt_token', token);
};

export const clearStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('companion_jwt_token');
  localStorage.removeItem('companion_user');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('companion_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('companion_user', JSON.stringify(user));
};

// Generic fetch wrapper with Bearer token
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Auto set application/json if body is not FormData and not already set
  if (!(options.body instanceof FormData) && !('Content-Type' in (headers as Record<string, string>))) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${currentBaseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(
      `Unable to connect to FastAPI server at ${currentBaseUrl}. Please ensure your backend is running.`
    );
  }

  if (response.status === 401) {
    clearStoredToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('companion:unauthorized'));
    }
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = `API Error: ${response.statusText}`;
    if (typeof errorData.detail === 'string') {
      msg = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      msg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
    } else if (errorData.message) {
      msg = errorData.message;
    }
    throw new Error(msg);
  }

  return response.json();
}

// Initial design documents matching Stitch references
export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    title: 'HR_Analytics_1691764152662.pdf',
    fileSize: '4.2 MB',
    pageCount: 32,
    uploadDate: 'Oct 14, 2024',
    status: 'ready',
  },
  {
    id: 2,
    title: 'Computer Networking Notes for Tech Placements (1).pdf',
    fileSize: '12.8 MB',
    pageCount: 118,
    uploadDate: 'Yesterday, 4:15 PM',
    status: 'ready',
  },
  {
    id: 3,
    title: 'Distributed_Systems_Midterm_Prep.pdf',
    fileSize: '8.1 MB',
    pageCount: 45,
    uploadDate: '5 mins ago',
    status: 'processing',
    progress: 64,
  },
];

// Sample AI summary data exactly as displayed in the Stitch design (Image 12.png)
export const SAMPLE_SUMMARY: DocumentSummary = {
  documentId: 2,
  documentTitle: 'Computer Networking Notes for Tech Placements (1).pdf',
  executiveOverview:
    'This document provides a concentrated technical review of fundamental computer networking architecture, protocols, and mechanisms required for technical placement interviews. Core emphasis spans the physical-to-application layers, transport handshakes, IP routing strategies, and Web security handshakes.',
  topics: [
    {
      id: 'topic-1',
      title: 'OSI Model & Protocol Stacks',
      content:
        'The 7-layer framework structures communication from Physical bits through Application interactions (HTTP/DNS). Layer 4 (Transport) and Layer 3 (Network - IP addressing & packet forwarding) govern end-to-end reliability and path determination.',
    },
    {
      id: 'topic-2',
      title: 'TCP vs. UDP Mechanisms',
      content:
        'TCP provides reliable, ordered, byte-stream transmission utilizing congestion control and windowing. UDP offers low-latency, connectionless datagram delivery with zero handshake overhead, optimal for DNS queries and real-time streaming.',
    },
    {
      id: 'topic-3',
      title: 'Connection Establishment (3-Way Handshake)',
      content:
        'TCP handshakes establish synchrony via SYN, SYN-ACK, and ACK transmissions. Connection teardown utilizes FIN packets with a TIME_WAIT buffer to prevent duplicate segment collision.',
    },
    {
      id: 'topic-4',
      title: 'DNS Resolution & HTTP / HTTPS',
      content:
        'Hierarchical DNS resolution navigates Root, TLD, and Authoritative servers. HTTPS augments plain HTTP by negotiating symmetric cipher sessions via TLS 1.3 cryptographic handshakes over port 443.',
    },
  ],
};

// 10 Practice Study Questions for Study Assistant
export const SAMPLE_STUDY_QUESTIONS: StudyQuestion[] = [
  {
    id: 1,
    question: 'What is the primary function of the Transport layer (Layer 4) in the OSI model?',
    answer:
      'The Transport layer provides transparent transfer of data between end users, handling host-to-host communication, segmentation, flow control, error detection (checksums), and multiplexing via port numbers (e.g. TCP, UDP).',
    topic: 'OSI Model',
  },
  {
    id: 2,
    question: 'How does the TCP 3-Way Handshake work during connection initiation?',
    answer:
      '1. Client sends SYN (synchronize sequence numbers) to server.\n2. Server responds with SYN-ACK acknowledging client sequence and sending its own sequence number.\n3. Client sends ACK acknowledging the server sequence. Connection is now ESTABLISHED.',
    topic: 'TCP Protocol',
  },
  {
    id: 3,
    question: 'Why does UDP have significantly lower latency compared to TCP?',
    answer:
      'UDP is connectionless and does not perform 3-way handshakes, sequence tracking, packet reordering, or retransmission timeouts. Datagrams are pushed directly with a lightweight 8-byte header.',
    topic: 'Transport Protocols',
  },
  {
    id: 4,
    question: 'Explain the difference between Symmetric and Asymmetric Encryption in TLS 1.3.',
    answer:
      'Asymmetric encryption (public/private key pairs) is used initially during the handshake to authenticate identity and securely negotiate a shared secret. Symmetric encryption (e.g., AES-GCM) uses that shared secret for rapid, low-overhead bulk payload encryption.',
    topic: 'Network Security',
  },
  {
    id: 5,
    question: 'What is the function of the Subnet Mask in IPv4 addressing?',
    answer:
      'The subnet mask separates the 32-bit IP address into the Network ID and the Host ID portion, determining which destination addresses are on the local subnet versus requiring default gateway routing.',
    topic: 'IP Addressing',
  },
  {
    id: 6,
    question: 'What occurs during TCP TIME_WAIT state and why is it necessary?',
    answer:
      'The host that initiated an active close enters TIME_WAIT for 2x Maximum Segment Lifetime (2MSL). This guarantees the final ACK reached the peer and prevents stale delayed packets from colliding with newly opened connections.',
    topic: 'TCP Connection Teardown',
  },
  {
    id: 7,
    question: 'How does DNS recursive query resolution work step-by-step?',
    answer:
      'The resolver contacts: 1. Local DNS cache -> 2. Root DNS Server (.) -> 3. TLD Server (.com) -> 4. Authoritative Name Server for the domain -> Returns A/AAAA IP record to client.',
    topic: 'Application Layer / DNS',
  },
  {
    id: 8,
    question: 'What is the difference between Flow Control and Congestion Control in TCP?',
    answer:
      'Flow control prevents the sender from overwhelming the receiver (managed via the Receiver Window - rwnd). Congestion control prevents senders from overwhelming intermediate network links and routers (managed via Congestion Window - cwnd).',
    topic: 'Congestion Management',
  },
  {
    id: 9,
    question: 'What role does ARP (Address Resolution Protocol) play in local subnet communication?',
    answer:
      'ARP translates a known Layer 3 IP address into a physical Layer 2 MAC address on the local ethernet network segment using broadcast requests and unicast replies.',
    topic: 'Data Link Layer',
  },
  {
    id: 10,
    question: 'Why is HTTP/2 multiplexing superior to HTTP/1.1 pipelining?',
    answer:
      'HTTP/2 splits requests into independent binary frames multiplexed over a single TCP connection, eliminating application-layer Head-of-Line (HoL) blocking and reducing connection overhead.',
    topic: 'Web Protocols',
  },
];

// Sample Quiz Questions matching Stitch Quiz screen (Image 14.jpeg)
export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary function of the Transport layer (Layer 4) in the OSI model?',
    options: [
      { key: 'A', text: 'Providing physical transmission media and signal encoding' },
      { key: 'B', text: 'End-to-end communication, flow control, error detection, and port addressing' },
      { key: 'C', text: 'Routing packets across multiple subnets via IP addresses' },
      { key: 'D', text: 'Formatting, encrypting, and compressing application data' },
    ],
    correctKey: 'B',
    explanation:
      'The Transport Layer (Layer 4) regulates host-to-host communications, segmentation, multiplexing with port numbers, flow control, and end-to-end reliability (e.g. TCP/UDP).',
  },
  {
    id: 2,
    question: 'Which flag combination represents the second packet in a standard TCP 3-way handshake?',
    options: [
      { key: 'A', text: 'SYN' },
      { key: 'B', text: 'ACK' },
      { key: 'C', text: 'SYN-ACK' },
      { key: 'D', text: 'FIN-ACK' },
    ],
    correctKey: 'C',
    explanation:
      'In response to the initial SYN packet from the client, the listening server responds with SYN-ACK to acknowledge the client sequence number and establish its own.',
  },
  {
    id: 3,
    question: 'What protocol operates at the Network Layer (Layer 3) to map IP addresses to MAC addresses?',
    options: [
      { key: 'A', text: 'DNS' },
      { key: 'B', text: 'ARP' },
      { key: 'C', text: 'DHCP' },
      { key: 'D', text: 'ICMP' },
    ],
    correctKey: 'B',
    explanation:
      'ARP (Address Resolution Protocol) resolves logical IP addresses into physical MAC addresses for transmission across local Ethernet media.',
  },
  {
    id: 4,
    question: 'Why is UDP considered a "connectionless" transport protocol?',
    options: [
      { key: 'A', text: 'It encrypts data before establishing sockets' },
      { key: 'B', text: 'It transmits datagrams without initiating a handshake or maintaining session state' },
      { key: 'C', text: 'It requires dedicated optical fiber connections' },
      { key: 'D', text: 'It cannot be routed across internet gateways' },
    ],
    correctKey: 'B',
    explanation:
      'UDP does not establish a virtual circuit through handshakes. Datagrams are transmitted independently with minimal overhead and zero retransmission guarantees.',
  },
  {
    id: 5,
    question: 'What standard TCP port does HTTPS listen on by default?',
    options: [
      { key: 'A', text: 'Port 80' },
      { key: 'B', text: 'Port 22' },
      { key: 'C', text: 'Port 443' },
      { key: 'D', text: 'Port 8080' },
    ],
    correctKey: 'C',
    explanation:
      'HTTPS traffic defaults to port 443 using TLS/SSL cryptographic tunnels, whereas unencrypted HTTP operates over port 80.',
  },
  {
    id: 6,
    question: 'Which mechanism prevents a fast sender from overflowing a slow receiver in TCP?',
    options: [
      { key: 'A', text: 'Congestion Window (cwnd)' },
      { key: 'B', text: 'Receiver Advertised Window (rwnd)' },
      { key: 'C', text: 'Slow Start Threshold' },
      { key: 'D', text: 'Checksum validation' },
    ],
    correctKey: 'B',
    explanation:
      'Flow control uses rwnd (Receiver Window) advertised in the TCP header to inform the sender of available buffer capacity.',
  },
  {
    id: 7,
    question: 'In IPv4 CIDR notation, what does "/24" specify?',
    options: [
      { key: 'A', text: '24 available client IP addresses' },
      { key: 'B', text: '24 bits allocated to the Network prefix (leaving 8 bits for 256 host addresses)' },
      { key: 'C', text: 'A maximum transmission unit of 24 kilobytes' },
      { key: 'D', text: 'A 24-millisecond routing hop penalty' },
    ],
    correctKey: 'B',
    explanation:
      '/24 denotes a subnet mask of 255.255.255.0, meaning the first 24 bits are fixed for the network and 8 bits are reserved for host addressing.',
  },
  {
    id: 8,
    question: 'What is the purpose of the TCP TIME_WAIT state during socket closure?',
    options: [
      { key: 'A', text: 'To wait for new incoming client requests on the same port' },
      { key: 'B', text: 'To ensure the final ACK arrives and prevent old delayed duplicate packets from corrupting new sessions' },
      { key: 'C', text: 'To re-encrypt session keys before discarding memory' },
      { key: 'D', text: 'To synchronize system clocks with NTP servers' },
    ],
    correctKey: 'B',
    explanation:
      'TIME_WAIT holds the socket for 2MSL (Maximum Segment Lifetime) to safely absorb straggling in-flight duplicate packets.',
  },
  {
    id: 9,
    question: 'What type of DNS server maintains the authoritative zone file containing actual domain records?',
    options: [
      { key: 'A', text: 'Root Name Server' },
      { key: 'B', text: 'Top-Level Domain (TLD) Server' },
      { key: 'C', text: 'Authoritative Name Server' },
      { key: 'D', text: 'Recursive Resolver' },
    ],
    correctKey: 'C',
    explanation:
      'Authoritative Name Servers hold the definitive DNS records (A, CNAME, MX, TXT) for specific domains.',
  },
  {
    id: 10,
    question: 'Which layer of the OSI stack is responsible for data encryption and syntax conversion?',
    options: [
      { key: 'A', text: 'Layer 7 (Application)' },
      { key: 'B', text: 'Layer 6 (Presentation)' },
      { key: 'C', text: 'Layer 5 (Session)' },
      { key: 'D', text: 'Layer 4 (Transport)' },
    ],
    correctKey: 'B',
    explanation:
      'The Presentation Layer (Layer 6) handles syntax representation, data serialization, compression, and encryption/decryption.',
  },
];

// Initial Chat messages for Ask AI
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Hello Alex! I am ready to answer questions directly from your selected notes: **Computer Networking Notes for Tech Placements (1).pdf**.\n\nAll answers are strictly grounded in your notes with page and section references. What concept would you like me to clarify?',
    timestamp: 'Just now',
  },
];

// API Service functions
export const api = {
  // Auth: OAuth2PasswordRequestForm expects application/x-www-form-urlencoded with username & password
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const formData = new URLSearchParams();
    formData.append('username', email.trim());
    formData.append('password', password);

    let response: Response;
    try {
      response = await fetch(`${currentBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: formData.toString(),
      });
    } catch (netErr: any) {
      throw new Error(
        `Unable to reach FastAPI backend at ${currentBaseUrl}. Please ensure your server is running on port 8000 or configure the API URL.`
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let msg = 'Authentication failed. Please verify credentials.';
      if (typeof errorData.detail === 'string') {
        msg = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        msg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
      } else if (errorData.message) {
        msg = errorData.message;
      }
      throw new Error(msg);
    }

    const data = await response.json();
    const token = data.access_token;
    if (!token) {
      throw new Error('No access token returned from backend.');
    }

    setStoredToken(token);

    const user: User = data.user || {
      id: data.user_id || email,
      email: email,
      fullName: data.full_name || data.name || email.split('@')[0],
      major: data.major || 'Computer Science',
      classYear: data.class_year || "'25",
      token: token,
    };
    setStoredUser(user);

    return { access_token: token, user };
  },

  // Demo student login for offline preview testing
  loginDemo: (): { access_token: string; user: User } => {
    const demoUser: User = {
      id: 1,
      email: 'alex.rivera@university.edu',
      fullName: 'Alex Rivera',
      major: 'Computer Science',
      classYear: "'25",
      token: 'demo-jwt-token-alex-rivera',
    };
    setStoredToken('demo-jwt-token-alex-rivera');
    setStoredUser(demoUser);
    return { access_token: 'demo-jwt-token-alex-rivera', user: demoUser };
  },

  // Register: POST /auth/register
  register: async (
  fullName: string,
  email: string,
  password: string
): Promise<{ access_token?: string; user?: User; message?: string }> => {
  let response: Response;

  try {
    const params = new URLSearchParams();

    params.append('name', fullName.trim());
    params.append('email', email.trim());
    params.append('password', password);

    response = await fetch(`${currentBaseUrl}/auth/register?${params.toString()}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (netErr: any) {
    throw new Error(
      `Unable to reach FastAPI backend at ${currentBaseUrl}. Please ensure your server is running on port 8000.`
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    let msg = 'Registration failed. Please try again.';

    if (typeof errorData.detail === 'string') {
      msg = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      msg = errorData.detail
        .map((e: any) => e.msg || JSON.stringify(e))
        .join('; ');
    } else if (errorData.message) {
      msg = errorData.message;
    }

    throw new Error(msg);
  }

  const data = await response.json();

  // Your backend currently returns:
  // {
  //   "message": "User registered successfully",
  //   "user_id": 1
  // }

  const user: User = {
    id: data.user_id,
    email: email.trim(),
    fullName: fullName.trim(),
  };

  setStoredUser(user);

  return {
    user,
    message: data.message || 'Account created successfully!',
  };
},

  // Documents: GET /documents/ (or /documents)
  getDocuments: async (): Promise<DocumentItem[]> => {
    try {
      let res: any;
      try {
        res = await apiFetch<any>('/documents/');
      } catch (e) {
        // Retry without trailing slash if 404
        res = await apiFetch<any>('/documents');
      }

      const rawList = Array.isArray(res) ? res : res?.documents || [];
      return rawList.map((doc: any, index: number) => ({
        id: doc.id ?? index + 1,
        title: doc.title || doc.filename || doc.name || `Document ${index + 1}.pdf`,
        fileSize:
          doc.fileSize ||
          (doc.file_size
            ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`
            : doc.size || '4.2 MB'),
        pageCount: doc.pageCount || doc.page_count || doc.pages || 1,
        uploadDate: doc.uploadDate || doc.upload_date || doc.created_at || 'Recently',
        status: doc.status || 'ready',
        progress: doc.progress,
      }));
    } catch (err) {
      // In demo mode or if offline prototype preview, fall back to initial documents
      const token = getStoredToken();
      if (token === 'demo-jwt-token-alex-rivera') {
        return SAMPLE_DOCUMENTS;
      }
      throw err;
    }
  },

  // Upload Document: POST /documents/upload
  uploadDocument: async (file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      id: res.id || res.document_id || Date.now(),
      title: res.title || res.filename || file.name,
      fileSize: res.fileSize || `${sizeMb} MB`,
      pageCount: res.pageCount || res.page_count || 1,
      uploadDate: res.uploadDate || 'Just now',
      status: res.status || 'ready',
    };
  },

  deleteDocument: async (documentId: number | string): Promise<{ success: boolean }> => {
    try {
      return await apiFetch<{ success: boolean }>(`/documents/${documentId}`, {
        method: 'DELETE',
      });
    } catch {
      return { success: true };
    }
  },

  // Study Assistant: AI Summary -> POST /study/{document_id}/summary
  getSummary: async (documentId: number | string): Promise<DocumentSummary> => {
    try {
      const res = await apiFetch<any>(`/study/${documentId}/summary`, {
        method: 'POST',
      });

      let overview = '';
      let topics: { id: string; title: string; content: string }[] = [];

      if (typeof res === 'string') {
        overview = res;
      } else if (res.summary) {
        overview = typeof res.summary === 'string' ? res.summary : JSON.stringify(res.summary);
      } else if (res.executive_overview || res.executiveOverview) {
        overview = res.executive_overview || res.executiveOverview;
      } else if (res.text || res.content) {
        overview = res.text || res.content;
      }

      if (Array.isArray(res.topics)) {
        topics = res.topics.map((t: any, i: number) => ({
          id: t.id || `topic-${i + 1}`,
          title: t.title || t.name || `Topic ${i + 1}`,
          content: t.content || t.description || t.summary || '',
        }));
      }

      return {
        documentId,
        documentTitle: res.documentTitle || res.title || 'Selected Document',
        executiveOverview: overview || 'Summary generated successfully.',
        topics: topics.length > 0 ? topics : undefined,
      };
    } catch (err) {
      const token = getStoredToken();
      if (token === 'demo-jwt-token-alex-rivera') {
        return SAMPLE_SUMMARY;
      }
      throw err;
    }
  },

  // Study Assistant: Practice Questions -> POST /study/{document_id}/questions
  getStudyQuestions: async (documentId: number | string): Promise<StudyQuestion[]> => {
    try {
      const res = await apiFetch<any>(`/study/${documentId}/questions`, {
        method: 'POST',
      });

      const rawQuestions = Array.isArray(res) ? res : res?.quiz || res?.questions || [];
      return rawQuestions.map((q: any, i: number) => ({
        id: q.id || i + 1,
        question: q.question || q.text || q.prompt || `Question ${i + 1}`,
        answer: q.answer || q.explanation || q.solution || '',
        topic: q.topic || q.category || 'Core Concepts',
      }));
    } catch (err) {
      const token = getStoredToken();
      if (token === 'demo-jwt-token-alex-rivera') {
        return SAMPLE_STUDY_QUESTIONS;
      }
      throw err;
    }
  },

  // Quiz: Questions -> POST /study/{document_id}/quiz
  getQuiz: async (documentId: number | string): Promise<QuizQuestion[]> => {
    try {
      const res = await apiFetch<any>(`/study/${documentId}/quiz`, {
        method: 'POST',
      });

      const rawQuestions = Array.isArray(res) ? res : res?.quiz || res?.questions || [];
      return rawQuestions.map((q: any, i: number) => {
        let options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = [];
        const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

        if (Array.isArray(q.options)) {
          options = q.options.map((opt: any, optIdx: number) => {
            if (typeof opt === 'string') {
              return { key: keys[optIdx] || 'A', text: opt };
            }
            return {
              key: (opt.key || keys[optIdx] || 'A') as 'A' | 'B' | 'C' | 'D',
              text: opt.text || opt.value || opt.option || String(opt),
            };
          });
        }

        const correct =
          q.correct_answer ||
          q.correctAnswer ||
          q.correct_key ||
          q.correctKey ||
          q.answer ||
          'A';

        return {
          id: q.id || i + 1,
          question: q.question || q.text || `Question ${i + 1}`,
          options,
          correctKey:
            typeof correct === 'string' && ['A', 'B', 'C', 'D'].includes(correct.toUpperCase())
              ? (correct.toUpperCase() as 'A' | 'B' | 'C' | 'D')
              : 'A',
          explanation: q.explanation || q.rationale || '',
        };
      });
    } catch (err) {
      const token = getStoredToken();
      if (token === 'demo-jwt-token-alex-rivera') {
        return SAMPLE_QUIZ_QUESTIONS;
      }
      throw err;
    }
  },

  // Ask AI: Query -> POST /study/{document_id}/ask
  askQuestion: async (
    documentId: number | string,
    question: string
  ): Promise<{ answer: string; citations?: string[] }> => {
    try {
      const res = await apiFetch<any>(`/study/${documentId}/ask`, {
        method: 'POST',
        body: JSON.stringify({ question }),
      });

      const answer =
        typeof res === 'string'
          ? res
          : res.answer || res.response || res.message || res.text || JSON.stringify(res);
      const citations = Array.isArray(res.citations)
        ? res.citations.map((c: any) => (typeof c === 'string' ? c : c.quote || c.text || JSON.stringify(c)))
        : [];
      return { answer, citations };
    } catch (err) {
      const token = getStoredToken();
      if (token === 'demo-jwt-token-alex-rivera') {
        // Grounded fallback for offline testing
        const qLower = question.toLowerCase();
        if (qLower.includes('tcp') && qLower.includes('udp')) {
          return {
            answer:
              'According to Section 4.2 of your notes:\n\n• **TCP** is connection-oriented, performs a 3-way handshake (SYN, SYN-ACK, ACK), guarantees packet delivery order via sequence numbers, and provides flow/congestion control.\n\n• **UDP** is connectionless with zero handshake overhead, pushing 8-byte datagrams without retransmission or ordering guarantees, making it suitable for low-latency applications like DNS queries and live media streaming.',
            citations: ['Page 28: Section 4.2 - Transport Layer Protocols', 'Page 31: Performance Trade-offs'],
          };
        } else if (qLower.includes('handshake') || qLower.includes('3-way')) {
          return {
            answer:
              'From Section 4.5 ("Connection Lifecycle"):\n\n1. **SYN**: The client selects an initial sequence number (ISN_c) and sends a TCP segment with SYN=1.\n2. **SYN-ACK**: The server responds with SYN=1, ACK=1, acknowledging ISN_c + 1 and providing its own ISN_s.\n3. **ACK**: The client sends ACK=1 acknowledging ISN_s + 1. The socket transitions to ESTABLISHED state.',
            citations: ['Page 34: Section 4.5 - TCP 3-Way Handshake Timing Diagrams'],
          };
        }
        return {
          answer: `Based on your notes: "${question}" is addressed in your course curriculum. Key concepts involve protocol layering, packet encapsulation, and end-to-end socket states.`,
          citations: ['Page 12: Architecture Overview', 'Page 45: Placement Review'],
        };
      }
      throw err;
    }
  },

  getStoredToken: (): string | null => {
    return getStoredToken();
  },

  getCurrentUser: (): User | null => {
    return getStoredUser();
  },

  logout: (): void => {
    clearStoredToken();
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      if (!currentBaseUrl) return false;
      const res = await fetch(`${currentBaseUrl}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
