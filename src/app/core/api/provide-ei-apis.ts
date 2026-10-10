import { Provider } from '@angular/core';

import { TENANT_API } from './tenant.api';
import { CONNECTION_API } from './connection.api';
import { AUTH_PROFILE_API } from './auth-profile.api';
import { RATE_LIMIT_API } from './rate-limit.api';
import { WATERMARK_API } from './watermark.api';
import { JOB_API } from './job.api';
import { EXECUTION_API } from './execution.api';
import { TASK_LOG_API } from './task-log.api';
import { SCATTER_ITEM_API } from './scatter-item.api';
import { DLQ_API } from './dlq.api';
import { STORED_CREDENTIAL_API } from './stored-credential.api';
import { CHAT_API } from './chat.api';

import { FakeTenantApi } from './fake/fake-tenant.api';
import { FakeConnectionApi } from './fake/fake-connection.api';
import { FakeAuthProfileApi } from './fake/fake-auth-profile.api';
import { FakeRateLimitApi } from './fake/fake-rate-limit.api';
import { FakeWatermarkApi } from './fake/fake-watermark.api';
import { FakeJobApi } from './fake/fake-job.api';
import { FakeExecutionApi } from './fake/fake-execution.api';
import { FakeTaskLogApi } from './fake/fake-task-log.api';
import { FakeScatterItemApi } from './fake/fake-scatter-item.api';
import { FakeDlqApi } from './fake/fake-dlq.api';
import { FakeStoredCredentialApi } from './fake/fake-stored-credential.api';
import { FakeChatApi } from './fake/fake-chat.api';

import { HttpTenantApi } from './http/http-tenant.api';
import { HttpConnectionApi } from './http/http-connection.api';
import { HttpRateLimitApi } from './http/http-rate-limit.api';
import { HttpWatermarkApi } from './http/http-watermark.api';
import { HttpJobApi } from './http/http-job.api';
import { HttpExecutionApi } from './http/http-execution.api';
import { HttpTaskLogApi } from './http/http-task-log.api';
import { HttpScatterItemApi } from './http/http-scatter-item.api';
import { HttpStoredCredentialApi } from './http/http-stored-credential.api';
import { HttpAuthProfileApi, HttpDlqApi } from './http';
import { HttpChatApi } from './http/http-chat.api';
import { environment } from '../../../environments/environment';

export function provideEiApis(): Provider[] {
  const useFake = environment.useFakeApi;

  return [
    { provide: TENANT_API,            useClass: useFake ? FakeTenantApi            : HttpTenantApi            },
    { provide: CONNECTION_API,        useClass: useFake ? FakeConnectionApi        : HttpConnectionApi        },
    { provide: AUTH_PROFILE_API,      useClass: useFake ? FakeAuthProfileApi       : HttpAuthProfileApi       },
    { provide: RATE_LIMIT_API,        useClass: useFake ? FakeRateLimitApi         : HttpRateLimitApi         },
    { provide: WATERMARK_API,         useClass: useFake ? FakeWatermarkApi         : HttpWatermarkApi         },
    { provide: JOB_API,               useClass: useFake ? FakeJobApi               : HttpJobApi               },
    { provide: EXECUTION_API,         useClass: useFake ? FakeExecutionApi         : HttpExecutionApi         },
    { provide: TASK_LOG_API,          useClass: useFake ? FakeTaskLogApi           : HttpTaskLogApi           },
    { provide: SCATTER_ITEM_API,      useClass: useFake ? FakeScatterItemApi       : HttpScatterItemApi       },
    { provide: DLQ_API,               useClass: useFake ? FakeDlqApi               : HttpDlqApi               },
    { provide: STORED_CREDENTIAL_API, useClass: useFake ? FakeStoredCredentialApi  : HttpStoredCredentialApi  },
    { provide: CHAT_API,              useClass: useFake ? FakeChatApi              : HttpChatApi              },
  ];
}