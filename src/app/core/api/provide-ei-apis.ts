import { Provider } from '@angular/core';

import { TENANT_API, TenantApi } from './tenant.api';
import { CONNECTION_API } from './connection.api';
import { AUTH_PROFILE_API } from './auth-profile.api';
import { RATE_LIMIT_API } from './rate-limit.api';
import { WATERMARK_API } from './watermark.api';
import { JOB_API } from './job.api';
import { EXECUTION_API } from './execution.api';
import { TASK_LOG_API } from './task-log.api';
import { SCATTER_ITEM_API } from './scatter-item.api';
import { DLQ_API } from './dlq.api';

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


import { environment } from '../../../environments/environment';
import { HttpAuthProfileApi, HttpConnectionApi, HttpDlqApi, HttpExecutionApi, HttpJobApi, HttpRateLimitApi, HttpScatterItemApi, HttpTaskLogApi, HttpTenantApi, HttpWatermarkApi } from './fake/http';


import { STORED_CREDENTIAL_API } from './stored-credential.api';
import { FakeStoredCredentialApi } from './fake/fake-stored-credential.api';
import { HttpStoredCredentialApi } from './http/http-stored-credential.api';

/**
 * Returns the full provider list for every EI API resource.
 *
 * When `environment.useFakeApi` is `true`, the fakes back the console and no
 * backend is required. When it is `false`, the HTTP implementations target the
 * .NET 10 Web API at `environment.apiBaseUrl`. Nothing else in the app changes
 * when this flag flips.
 */
export function provideEiApis(): Provider[] {
  const useFake = environment.useFakeApi;

  return [
    { provide: TENANT_API,       useClass: useFake ? FakeTenantApi       : HttpTenantApi       },
    { provide: CONNECTION_API,   useClass: useFake ? FakeConnectionApi   : HttpConnectionApi   },
    { provide: AUTH_PROFILE_API, useClass: useFake ? FakeAuthProfileApi  : HttpAuthProfileApi  },
    { provide: RATE_LIMIT_API,   useClass: useFake ? FakeRateLimitApi    : HttpRateLimitApi    },
    { provide: WATERMARK_API,    useClass: useFake ? FakeWatermarkApi    : HttpWatermarkApi    },
    { provide: JOB_API,          useClass: useFake ? FakeJobApi          : HttpJobApi          },
    { provide: EXECUTION_API,    useClass: useFake ? FakeExecutionApi    : HttpExecutionApi    },
    { provide: TASK_LOG_API,     useClass: useFake ? FakeTaskLogApi      : HttpTaskLogApi      },
    { provide: SCATTER_ITEM_API, useClass: useFake ? FakeScatterItemApi  : HttpScatterItemApi  },
    { provide: DLQ_API,          useClass: useFake ? FakeDlqApi          : HttpDlqApi          },
    { provide: STORED_CREDENTIAL_API, useClass: useFake ? FakeStoredCredentialApi : HttpStoredCredentialApi },
  ];
}