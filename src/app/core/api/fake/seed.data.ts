import {
  AuthProfile,
  Connection,
  DlqItem,
  Execution,
  Job,
  RateLimit,
  ScatterItem,
  TaskLogEntry,
  Tenant,
  Watermark,
} from '../../models';

export const SEED_TENANTS: Tenant[] = [
  {
    id: 'broker-uae', code: 'broker-uae', name: 'Broker UAE',
    coreUrl: 'https://core-uae.insureliv.com/api/v2', coreDbRef: '', active: true,
  },
  {
    id: 'broker-ksa', code: 'broker-ksa', name: 'Broker KSA',
    coreUrl: 'https://core-ksa.insureliv.com/api/v2', coreDbRef: '', active: true,
  },
  {
    id: 'broker-qat', code: 'broker-qat', name: 'Broker Qatar',
    coreUrl: 'https://core-qat.insureliv.com/api/v2', coreDbRef: '', active: true,
  },
];

export const SEED_CONNECTIONS: Connection[] = [
  { id:'conn-1', name:'Insurer Policies API', provider:'AXA Gulf', protocol:'Rest', baseUrl:'https://api.axa-gulf.ae/v2', tenant:'broker-uae', authProfile:'auth-1', status:'Active', timeout:30000, headers:'{"Accept":"application/json"}' },
  { id:'conn-2', name:'Core Policy API', provider:'InsureLiv', protocol:'Rest', baseUrl:'https://core.insureliv.com/api/v2', tenant:'broker-uae', authProfile:'auth-1', status:'Active', timeout:30000, headers:'{"Accept":"application/json"}' },
  { id:'conn-3', name:'Legacy SOAP Gateway', provider:'Daman', protocol:'Soap', baseUrl:'https://legacy.daman.ae/ws', tenant:'broker-uae', authProfile:'auth-4', status:'Active', timeout:45000, headers:'{"SOAPAction":"urn:policy"}' },
  { id:'conn-4', name:'Broker KSA Provider', provider:'Bupa Arabia', protocol:'Rest', baseUrl:'https://api.bupa.com.sa/v1', tenant:'broker-ksa', authProfile:'auth-5', status:'Active', timeout:30000, headers:'{"Accept":"application/json"}' },
  { id:'conn-5', name:'Shared Salesforce CRM', provider:'Salesforce', protocol:'Rest', baseUrl:'https://insureliv.my.salesforce.com', tenant:'__shared', authProfile:'auth-2', status:'Active', timeout:20000, headers:'{"Accept":"application/json"}' },
  { id:'conn-6', name:'Provider A Policies API', provider:'AXA Gulf', protocol:'Rest', baseUrl:'https://api.providerA.ae/v1', tenant:'broker-uae', authProfile:'auth-1', status:'Active', timeout:30000, headers:'{"Accept":"application/json"}' },
  { id:'conn-7', name:'Provider B Customers API', provider:'Oman Insurance', protocol:'Rest', baseUrl:'https://api.providerB.om/v1', tenant:'broker-uae', authProfile:'auth-2', status:'Active', timeout:30000, headers:'{"Accept":"application/json"}' },
  { id:'conn-8', name:'Provider C Vehicles API', provider:'Sukoon', protocol:'Rest', baseUrl:'https://api.providerC.ae/v1', tenant:'broker-uae', authProfile:'auth-2', status:'Active', timeout:30000, headers:'{"Accept":"application/json"}' },
  { id:'conn-9', name:'Provider D Claims API', provider:'Daman', protocol:'Rest', baseUrl:'https://api.providerD.ae/v1', tenant:'broker-uae', authProfile:'auth-4', status:'Active', timeout:45000, headers:'{"Accept":"application/json"}' },
  { id:'conn-10', name:'InsureLiv Core DB', provider:'InsureLiv', protocol:'SqlServer',
    baseUrl:'Server=tcp:insureliv-sql.database.windows.net,1433;Database=InsureLivCore;Encrypt=True;TrustServerCertificate=False;',
    tenant:'broker-uae', authProfile:'auth-7', status:'Active', timeout:30,
    headers:'' },
      { id:'conn-11', name:'Legacy Reporting DB', provider:'InsureLiv Internal', protocol:'SqlServer',
    baseUrl:'Server=tcp:legacy-reporting.internal,1433;Database=Reports;Encrypt=True;TrustServerCertificate=True;',
    tenant:'broker-uae', authProfile:'auth-8', status:'Active', timeout:60,
    headers:'' },
];

export const SEED_AUTH_PROFILES: AuthProfile[] = [
  {
    id:'auth-1', name:'Keycloak Auth Code + Exchange', type:'KeycloakAuthCodeExchange',
    realm:'insureliv', audience:'insureliv-core-api', kcBaseUrl:'https://auth.insureliv.com',
    clientId:'ei-platform',
    secretRef:'https://insureliv-kv.vault.azure.net/secrets/ei-keycloak-client-secret',
    scope:'openid profile email', tenant:'broker-uae',
  },
  {
    id:'auth-2', name:'OAuth2 Client Credentials (AXA)', type:'OAuth2ClientCredentials',
    realm:'—', audience:'axa-api', kcBaseUrl:'', clientId:'axa-cc',
    secretRef:'https://kv.vault.azure.net/secrets/axa-cc-secret', scope:'read', tenant:'broker-uae',
  },
  {
    id:'auth-3', name:'API Key (Legacy Provider)', type:'ApiKey',
    realm:'—', audience:'—', kcBaseUrl:'', clientId:'',
    secretRef:'https://kv.vault.azure.net/secrets/legacy-api-key', scope:'', tenant:'broker-uae',
  },
  {
    id:'auth-4', name:'WS-Security UsernameToken', type:'WsSecurityUsernameToken',
    realm:'—', audience:'—', kcBaseUrl:'', clientId:'daman-user',
    secretRef:'https://kv.vault.azure.net/secrets/daman-ws-pass', scope:'', tenant:'broker-uae',
  },
  {
    id:'auth-5', name:'Keycloak Auth Code + Exchange (KSA)', type:'KeycloakAuthCodeExchange',
    realm:'insureliv-ksa', audience:'insureliv-core-api', kcBaseUrl:'https://auth.insureliv.com',
    clientId:'ei-platform',
    secretRef:'https://insureliv-kv.vault.azure.net/secrets/ei-keycloak-client-secret',
    scope:'openid profile email', tenant:'broker-ksa',
  },
  {
    id:'auth-6', name:'mTLS · Daman X.509', type:'MutualTls',
    certRef:'https://kv.vault.azure.net/secrets/daman-client-cert',
    keyRef:'https://kv.vault.azure.net/secrets/daman-client-key',
    caRef:'https://kv.vault.azure.net/secrets/daman-ca-cert',
    passRef:'', thumbprint:'', tenant:'broker-uae',
  },
  {
    id: 'auth-7', name: 'SQL Server · InsureLiv Core DB', type: 'SqlServerConnectionString',
    credentialStorageMode: 'KeyVault',
    connectionStringSecretRef:
      'https://insureliv-kv.vault.azure.net/secrets/ei-sql-core-credentials',
    tenant: 'broker-uae',
  },
    {
    id: 'auth-8', name: 'SQL Server · Legacy Reporting (inline)',
    type: 'SqlServerConnectionString',
    credentialStorageMode: 'Inline',
    inlineConnectionString:
      'Server=tcp:legacy-reporting.internal,1433;Database=Reports;User ID=ei_reader;Password=ReadOnly_2026!;Encrypt=True;TrustServerCertificate=True;',
    tenant: 'broker-uae',
  },
];

export const SEED_RATE_LIMITS: RateLimit[] = [
  { id:'rl-1', connectionId:'conn-1', scope:'PerConnection', rps:50, burst:100, concurrent:20 },
  { id:'rl-2', connectionId:'conn-2', scope:'PerConnection', rps:500, burst:1000, concurrent:100 },
  { id:'rl-3', connectionId:'conn-3', scope:'PerConnection', rps:10, burst:20, concurrent:5 },
  { id:'rl-4', connectionId:'conn-5', scope:'Global', rps:100, burst:200, concurrent:30 },
];

export const SEED_WATERMARKS: Watermark[] = [
  { id:'wm-1', tenant:'broker-uae', jobId:1, jobName:'Policy Master Sync', entityName:'Policies', type:'Timestamp', value:'2026-09-19T20:00:00Z', updatedAt:'19 Sep 2026 20:15' },
  { id:'wm-2', tenant:'broker-uae', jobId:1, jobName:'Policy Master Sync', entityName:'Endorsements', type:'SequenceToken', value:'SEQ-48217', updatedAt:'19 Sep 2026 20:15' },
  { id:'wm-3', tenant:'broker-ksa', jobId:5, jobName:'KSA Policy Master Sync', entityName:'Policies', type:'PageCursor', value:'CURSOR-5b8a', updatedAt:'19 Sep 2026 19:33' },
];

export const SEED_JOBS: Job[] = [
  {
    id: 1, name:'Policy Master Sync', slug:'policy-master-sync', tenant:'broker-uae',
    status:'Active', trigger:'Scheduled', cron:'0 */15 * * * *',
    created:'18 Sep 2026 10:42', lastRun:'19 Sep 2026 20:00', next:'Every 15 min · 20:15',
    description:'Sync policy master data from insurer APIs to InsureLiv Core.',
    version:7, publishedAt:'19 Sep 2026 14:22', publishedBy:'ahmed.k',
    pipeline: [
      {
        id:'t1', type:'ApiPull', name:'Pull Insurer Policies',
        connectionId:'conn-1', authId:'auth-1', url:'/v2/policies',
        method:'GET', timeout:30, outputKey:'ERP_Source',
        sampleResponse: `{
  "items": [
    {
      "id": "A-100",
      "policy_no": "POL-2026-00192",
      "customer_id": "CUS-8821",
      "qty": 2,
      "unit_price": 45.5,
      "premium": 12450,
      "insurer_code": "INS-001",
      "start_date": "2026-09-20",
      "coverage_type": "Comprehensive"
    },
    {
      "id": "B-200",
      "policy_no": "POL-2026-00193",
      "customer_id": "CUS-8822",
      "qty": 3,
      "unit_price": 12,
      "premium": 8900,
      "insurer_code": "INS-002",
      "start_date": "2026-09-21",
      "coverage_type": "Third-Party"
    }
  ]
}`,
      },
      {
        id:'t2', type:'Transform', name:'Normalize Policy',
        inputSource:'ERP_Source.items',
        jsonata: 'items.{\n  "policyNumber": policy_no,\n  "customerId": customer_id,\n  "premium": premium,\n  "premiumWithVAT": $round(premium * 1.05, 2),\n  "provider": insurer_code,\n  "effectiveFrom": start_date,\n  "coverage": coverage_type,\n  "isHighValue": premium > 10000\n}',
        iterate: true,
        subtasks: [
          {
            id:'s1', type:'ApiPush', name:'Push to Core',
            connectionId:'conn-2', authId:'auth-1', url:'/v2/policies',
            method:'POST', timeout:30,
            body:'{"policyNumber":$item.policyNumber,"premium":$item.premium}',
          },
        ],
      },
    ],
  },
  {
    id: 8, name:'Multi-Entity Sync', slug:'multi-entity-sync', tenant:'broker-uae',
    status:'Active', trigger:'Scheduled', cron:'0 0 */4 * * *',
    created:'20 Sep 2026 08:00', lastRun:'19 Sep 2026 20:00', next:'Every 4 hours',
    description:'DEMO — fork-join pattern with 4 parallel branches.',
    version:2, publishedAt:'20 Sep 2026 09:00', publishedBy:'ahmed.k',
    pipeline: [
      {
        id:'t1', type:'ApiPull', name:'Fetch composite payload',
        connectionId:'conn-1', authId:'auth-1', url:'/v2/sync',
        method:'GET', timeout:60, outputKey:'Source',
        sampleResponse: `{
  "policies": [
    { "policy_no": "POL-2026-00192", "premium": 12450, "customer_id": "CUS-8821" },
    { "policy_no": "POL-2026-00193", "premium": 8900, "customer_id": "CUS-8822" }
  ],
  "customers": [
    { "customer_id": "CUS-8821", "name": "Aisha Al Mansouri" },
    { "customer_id": "CUS-8822", "name": "Omar Rashid" }
  ],
  "vehicles": [
    { "vin": "JHMCM56557C404453", "make": "Toyota", "model": "Camry", "year": 2022, "value": 95000 }
  ],
  "claims": [
    { "claim_no": "CLM-2026-00091", "amount": 4500, "policy_no": "POL-2026-00192" }
  ]
}`,
      },
      {
        id:'t2', type:'Branch', name:'Policy processing',
        condition:'$exists($.policies) and $count($.policies) > 0',
        executionMode:'Sequential',
        children: [
          {
            id:'t2.1', type:'Transform', name:'Extract & normalize policies',
            inputSource:'$.policies',
            jsonata: '$map($.policies, function($p){ {"policyNumber": $p.policy_no, "premium": $p.premium, "customerId": $p.customer_id} })',
          },
          {
            id:'t2.2', type:'ApiPush', name:'Push to Provider A',
            connectionId:'conn-6', authId:'auth-1', url:'/v1/policies',
            method:'POST', timeout:30, body:'$item',
          },
        ],
      },
      {
        id:'t3', type:'Branch', name:'Customer processing',
        condition:'$exists($.customers) and $count($.customers) > 0',
        executionMode:'Sequential',
        children: [
          {
            id:'t3.1', type:'Transform', name:'Extract & normalize customers',
            inputSource:'$.customers',
            jsonata: '$map($.customers, function($c){ {"customerId": $c.customer_id, "fullName": $c.name} })',
          },
          {
            id:'t3.2', type:'ApiPush', name:'Push to Provider B',
            connectionId:'conn-7', authId:'auth-2', url:'/v1/customers',
            method:'POST', timeout:30, body:'$item',
          },
        ],
      },
      {
        id:'t4', type:'Branch', name:'Vehicle processing',
        condition:'$exists($.vehicles) and $count($.vehicles) > 0',
        executionMode:'Sequential',
        children: [
          {
            id:'t4.1', type:'Transform', name:'Extract & normalize vehicles',
            inputSource:'$.vehicles',
            jsonata: '$map($.vehicles, function($v){ {"vin": $v.vin, "make": $v.make, "model": $v.model, "year": $v.year, "insuredValue": $v.value} })',
          },
          {
            id:'t4.2', type:'ApiPush', name:'Push to Provider C',
            connectionId:'conn-8', authId:'auth-2', url:'/v1/vehicles',
            method:'POST', timeout:30, body:'$item',
          },
        ],
      },
      {
        id:'t5', type:'Branch', name:'Claims processing',
        condition:'$exists($.claims) and $count($.claims) > 0',
        executionMode:'Sequential',
        children: [
          {
            id:'t5.1', type:'Transform', name:'Extract & normalize claims',
            inputSource:'$.claims',
            jsonata: '$map($.claims, function($c){ {"claimNumber": $c.claim_no, "amount": $c.amount, "policyNumber": $c.policy_no} })',
          },
          {
            id:'t5.2', type:'ApiPush', name:'Push to Provider D',
            connectionId:'conn-9', authId:'auth-4', url:'/v1/claims',
            method:'POST', timeout:45, body:'$item',
          },
        ],
      },
      {
        id:'t_join', type:'JoinPoint', name:'Await all branches',
        joinMode:'WaitAll', joinThreshold:4,
        joinTimeoutSeconds:600, joinTimeoutAction:'Fail',
      },
      {
        id:'t_notify', type:'Notify', name:'Notify completion',
        kafkaTopic:'policy-sync.completed', timeout:10,
        body:'{"event":"multi-entity-sync.completed"}',
      },
    ],
  },
  {
    id: 2, name:'Provider Quote Pull', slug:'provider-quote-pull', tenant:'broker-uae',
    status:'Running', trigger:'Webhook', cron:'—',
    created:'14 Sep 2026 09:12', lastRun:'19 Sep 2026 20:02', next:'Manual / Webhook',
    description:'Pull live quotes from providers on demand.',
    version:3, publishedAt:'15 Sep 2026 09:00', publishedBy:'ahmed.k',
    pipeline: [
      {
        id:'t1', type:'ApiPull', name:'Quote API',
        connectionId:'conn-1', authId:'auth-1', url:'/v2/quotes',
        method:'GET', timeout:30, outputKey:'Quotes',
        sampleResponse: '{"quotes":[{"id":"Q-1","premium":1200}]}',
      },
    ],
  },
  {
    id: 5, name:'KSA Policy Master Sync', slug:'ksa-policy-master-sync', tenant:'broker-ksa',
    status:'Active', trigger:'Scheduled', cron:'0 */20 * * * *',
    created:'15 Sep 2026 08:30', lastRun:'19 Sep 2026 19:30', next:'Every 20 min',
    description:'KSA-specific policy sync.',
    version:2, publishedAt:'15 Sep 2026 08:30', publishedBy:'ahmed.k',
    pipeline: [
      {
        id:'t1', type:'ApiPull', name:'KSA Pull',
        connectionId:'conn-4', authId:'auth-5', url:'/v1/policies',
        method:'GET', timeout:30, outputKey:'KSA_Source',
        sampleResponse: '{"items":[{"policy_no":"KSA-001","premium":10000}]}',
      },
    ],
  },
  {
    id: 7, name:'Vehicle Fleet Sync', slug:'vehicle-fleet-sync', tenant:'broker-uae',
    status:'Active', trigger:'Scheduled', cron:'0 0 */6 * * *',
    created:'20 Sep 2026 08:00', lastRun:'—', next:'Every 6 hours',
    description:'Demo: JSONata features + scatter-gather.',
    version:1, publishedAt:'20 Sep 2026 08:00', publishedBy:'ahmed.k',
    pipeline: [
      {
        id:'t1', type:'ApiPull', name:'Pull Fleet Data',
        connectionId:'conn-1', authId:'auth-1', url:'/v2/fleet',
        method:'GET', timeout:30, outputKey:'Fleet_Source',
        sampleResponse: `{
  "fleet": [
    {
      "vin": "JHMCM56557C404453",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "value": 95000,
      "driver_id": "DRV-001",
      "status": "active",
      "fuel": "petrol"
    }
  ]
}`,
      },
      {
        id:'t2', type:'Transform', name:'Compute Insured Values',
        inputSource:'Fleet_Source.fleet',
        jsonata: 'fleet.{\n  "vin": vin,\n  "displayName": make & " " & model,\n  "insuredValue": value,\n  "annualPremium": $round(value * 0.025, 2)\n}',
        iterate: true,
        subtasks: [
          {
            id:'s1', type:'ApiPush', name:'Push to CRM',
            connectionId:'conn-5', authId:'auth-2',
            url:'/services/data/v59.0/sobjects/Asset',
            method:'POST', timeout:30, body:'{"Name":$item.displayName}',
          },
        ],
      },
    ],
  },
  {
    id: 3, name:'Claims Data Export', slug:'claims-export', tenant:'broker-uae',
    status:'Paused', trigger:'Scheduled', cron:'0 0 18 * * *',
    created:'02 Sep 2026 16:20', lastRun:'18 Sep 2026 18:00',
    next:'Daily 18:00 · Paused', description:'Export claims data nightly.',
    version:1, publishedAt:'02 Sep 2026 16:20', publishedBy:'ahmed.k', pipeline: [],
  },
  {
    id: 4, name:'Insurer Policy Update', slug:'insurer-policy-update', tenant:'broker-uae',
    status:'Active', trigger:'Scheduled', cron:'0 */5 * * * *',
    created:'01 Sep 2026 11:10', lastRun:'19 Sep 2026 19:45', next:'Every 5 min',
    description:'Push policy updates to insurers.',
    version:5, publishedAt:'10 Sep 2026 12:00', publishedBy:'ahmed.k', pipeline: [],
  },
  {
    id: 6, name:'Quote Status Webhook', slug:'quote-status-webhook', tenant:'broker-uae',
    status:'Active', trigger:'Webhook', cron:'—',
    created:'10 Sep 2026 14:20', lastRun:'19 Sep 2026 20:10', next:'On-demand',
    description:'Receive quote status updates via webhook.',
    version:1, publishedAt:'10 Sep 2026 14:20', publishedBy:'ahmed.k', pipeline: [],
  },
    {
    id: 9, name:'Pending Claims Extract', slug:'pending-claims-extract', tenant:'broker-uae',
    status:'Active', trigger:'Scheduled', cron:'0 0 */2 * * *',
    created:'05 Oct 2026 09:00', lastRun:'—', next:'Every 2 hours',
    description:'Extracts pending claims from InsureLiv Core DB and pushes them to the reinsurer.',
    version:1, publishedAt:'05 Oct 2026 09:00', publishedBy:'ahmed.k',
    pipeline: [
      {
        id:'t1', type:'SqlQuery', name:'Query pending claims',
        connectionId:'conn-10', authId:'auth-7',
        query: "SELECT claim_no, policy_no, amount, customer_id, claim_date\nFROM Claims\nWHERE status = 'Pending'\nORDER BY claim_date DESC;",
        queryTimeout: 60,
        outputKey: 'PendingClaims',
        sampleResponse: `[
  { "claim_no": "CLM-2026-00101", "policy_no": "POL-2026-00192", "amount": 4500, "customer_id": "CUS-8821", "claim_date": "2026-10-01" },
  { "claim_no": "CLM-2026-00102", "policy_no": "POL-2026-00193", "amount": 12300, "customer_id": "CUS-8822", "claim_date": "2026-10-02" }
]`,
      },
      {
        id:'t2', type:'Transform', name:'Map to reinsurer schema',
        inputSource:'PendingClaims',
        jsonata: '$map($, function($c){ {"claimNumber": $c.claim_no, "policyNumber": $c.policy_no, "amount": $c.amount, "customerId": $c.customer_id, "claimDate": $c.claim_date} })',
        iterate: true,
        subtasks: [
          {
            id:'s1', type:'ApiPush', name:'Push claim to reinsurer',
            connectionId:'conn-6', authId:'auth-1',
            url:'/v1/claims', method:'POST', timeout:30,
            body:'$item',
          },
        ],
      },
    ],
  },
];

export const SEED_EXECUTIONS: Execution[] = [
  {
    id:'9e1bc82', job:'Policy Master Sync', jobId:1, tenant:'broker-uae',
    status:'Running', started:'20:28:14', itemsDone:412, itemsTotal:500,
    failures:3, elapsedSec:261,
    correlationId:'c0a84927-8f11-4a7b-93e2-1c4f98d01a5e',
    triggerSource:'Scheduled', coreEvent:'— (scheduler tick)',
    workerInstance:'worker-pod-7b9c-xk2n', jobVersion:7,
    idempotencyKey:'pol-sync-2026-09-19-2000', hasBranches:false,
  },
  {
    id:'8f2ad41', job:'Provider Quote Pull', jobId:2, tenant:'broker-uae',
    status:'Completed', started:'19:55:02', itemsDone:48, itemsTotal:48,
    failures:0, elapsedSec:18,
    correlationId:'f13a8821-4b02-4a1c-9e34-00cff1a27b6d',
    triggerSource:'Webhook', coreEvent:'QuoteRequestCreated',
    workerInstance:'worker-pod-7b9c-lm4p', jobVersion:3,
    idempotencyKey:'quote-pull-q9x2', hasBranches:false,
  },
  {
    id:'multi8f', job:'Multi-Entity Sync', jobId:8, tenant:'broker-uae',
    status:'Running', started:'20:35:00', itemsDone:0, itemsTotal:0,
    failures:0, elapsedSec:74,
    correlationId:'d4e19a3c-71f2-4e0b-9a83-25b0c1e7f104',
    triggerSource:'Scheduled', coreEvent:'— (scheduler tick)',
    workerInstance:'worker-pod-7b9c-xk2n', jobVersion:2,
    idempotencyKey:'multi-entity-2026-09-19-2000', hasBranches:true,
    branches: [
      { id:'t2', name:'Policy processing', condition:'$.policies', status:'Completed', children: [
        { id:'t2.1', type:'Transform', name:'Extract & normalize policies', status:'Success', duration:412 },
        { id:'t2.2', type:'ApiPush', name:'Push to Provider A', status:'Success', duration:1890 },
      ]},
      { id:'t3', name:'Customer processing', condition:'$.customers', status:'Completed', children: [
        { id:'t3.1', type:'Transform', name:'Extract & normalize customers', status:'Success', duration:388 },
        { id:'t3.2', type:'ApiPush', name:'Push to Provider B', status:'Success', duration:2240 },
      ]},
      { id:'t4', name:'Vehicle processing', condition:'$.vehicles', status:'Running', children: [
        { id:'t4.1', type:'Transform', name:'Extract & normalize vehicles', status:'Success', duration:395 },
        { id:'t4.2', type:'ApiPush', name:'Push to Provider C', status:'Running', duration:0 },
      ]},
      { id:'t5', name:'Claims processing', condition:'$.claims', status:'Running', children: [
        { id:'t5.1', type:'Transform', name:'Extract & normalize claims', status:'Success', duration:410 },
        { id:'t5.2', type:'ApiPush', name:'Push to Provider D', status:'Running', duration:0 },
      ]},
    ],
    join: {
      id:'t_join', name:'Await all branches', joinMode:'WaitAll',
      joinThreshold:4, joinTimeoutSeconds:600, status:'Waiting',
      branchesSettled:2, branchesTotal:4,
    },
  },
  {
    id:'7c3de92', job:'KSA Policy Master Sync', jobId:5, tenant:'broker-ksa',
    status:'Completed', started:'19:30:11', itemsDone:320, itemsTotal:320,
    failures:0, elapsedSec:182,
    correlationId:'a27b3401-9d7e-4c14-bf00-221e8a3c5d10',
    triggerSource:'Scheduled', coreEvent:'— (scheduler tick)',
    workerInstance:'worker-pod-8d1a-pq8z', jobVersion:2,
    idempotencyKey:'ksa-pol-sync-2026-09-19-1930', hasBranches:false,
  },
];

export const SEED_TASK_LOG: TaskLogEntry[] = [
  { executionId:'9e1bc82', taskId:'t1', orderIndex:1, name:'Pull Insurer Policies', type:'ApiPull', status:'Success', attempt:1, started:'20:28:14', completed:'20:28:22', duration:8340, summary:'{"httpStatus":200,"itemCount":500}' },
  { executionId:'9e1bc82', taskId:'t2', orderIndex:2, name:'Normalize Policy', type:'Transform', status:'Success', attempt:1, started:'20:28:22', completed:'20:28:23', duration:420, summary:'{"itemCount":500}' },
  { executionId:'9e1bc82', taskId:'s1', orderIndex:3, name:'Push to Core', type:'ApiPush', status:'Running', attempt:1, started:'20:28:23', completed:'—', duration:0, summary:'{"completed":412,"failed":3,"inFlight":8,"queued":77}' },
  { executionId:'multi8f', taskId:'t1', parentTaskId:null, orderIndex:1, name:'Fetch composite payload', type:'ApiPull', status:'Success', attempt:1, started:'20:35:00', completed:'20:35:02', duration:2100, summary:'{"httpStatus":200,"branches":4}' },
  { executionId:'multi8f', taskId:'t_join', parentTaskId:null, orderIndex:6, name:'Await all branches', type:'JoinPoint', status:'Running', attempt:1, started:'20:35:02', completed:'—', duration:0, summary:'{"settled":2,"total":4,"mode":"WaitAll"}' },
  { executionId:'8f2ad41', taskId:'t1', orderIndex:1, name:'Quote API', type:'ApiPull', status:'Success', attempt:1, started:'19:55:02', completed:'19:55:20', duration:18000, summary:'{"httpStatus":200,"itemCount":48}' },
  { executionId:'7c3de92', taskId:'t1', orderIndex:1, name:'KSA Pull', type:'ApiPull', status:'Success', attempt:1, started:'19:30:11', completed:'19:33:13', duration:182000, summary:'{"httpStatus":200,"itemCount":320}' },
];

export const SEED_SCATTER_ITEMS: ScatterItem[] = [
  { executionId:'9e1bc82', id:'POL-000412', task:'Push to Core', taskId:'s1', status:'Completed', http:200, attempts:1, completed:'20:32:11' },
  { executionId:'9e1bc82', id:'POL-000413', task:'Push to Core', taskId:'s1', status:'Dispatched', http:'—', attempts:1, completed:'—' },
  { executionId:'9e1bc82', id:'POL-000414', task:'Push to Core', taskId:'s1', status:'Failed', http:503, attempts:3, completed:'20:32:16' },
];

export const SEED_DLQ: DlqItem[] = [
  { id:'DLQ-8821', item:'POL-000414', source:'ei.jobs.dlq', job:'Policy Master Sync', status:'Pending', error:'Provider 503', firstFailed:'19 Sep 2026 20:32', attempts:3 },
  { id:'DLQ-8819', item:'POL-000301', source:'ei.jobs.dlq', job:'Policy Master Sync', status:'Replayed', error:'Timeout', firstFailed:'19 Sep 2026 19:55', attempts:3 },
  { id:'DLQ-8817', item:'POL-000288', source:'policy.synced.retry', job:'Policy Master Sync', status:'Pending', error:'Schema validation', firstFailed:'19 Sep 2026 19:42', attempts:3 },
  { id:'DLQ-8815', item:'POL-000270', source:'ei.jobs.dlq', job:'Provider Quote Pull', status:'Discarded', error:'Auth failure', firstFailed:'19 Sep 2026 18:20', attempts:3 },
];

