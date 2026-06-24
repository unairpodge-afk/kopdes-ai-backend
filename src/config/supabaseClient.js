/**
 * Arvalabs Standalone Mock Database Client
 * Bypasses Supabase completely and executes queries against the in-memory mockDb.js
 * Implements full query-builder promise chaining (thenable) for select, insert, update, upsert, and delete.
 */
const mockDb = require('../models/mockDb');

console.log('[Arvalabs Database]: Running in standalone mock mode (Supabase disconnected).');

const createMockQuery = (tableName) => {
  return {
    table: tableName,
    filters: [],
    orders: [],
    action: 'select',
    payload: null,

    select(fields = '*') {
      this.action = 'select';
      return this;
    },

    eq(column, value) {
      this.filters.push({ type: 'eq', column, value });
      return this;
    },

    order(column, options = {}) {
      this.orders.push({ column, ascending: options.ascending !== false });
      return this;
    },

    delete() {
      this.action = 'delete';
      return this;
    },

    insert(payload) {
      this.action = 'insert';
      this.payload = payload;
      return this;
    },

    update(payload) {
      this.action = 'update';
      this.payload = payload;
      return this;
    },

    upsert(payload) {
      this.action = 'upsert';
      this.payload = payload;
      return this;
    },

    // Execute query when awaited
    async then(resolve, reject) {
      try {
        // --- 1. INSERT / UPSERT ---
        if (this.action === 'insert' || this.action === 'upsert') {
          const list = Array.isArray(this.payload) ? this.payload : [this.payload];
          const newRecords = [];

          for (const item of list) {
            const record = {
              id: item.id || `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              created_at: new Date().toISOString(),
              ...item
            };

            if (this.table === 'delphi_responses') {
              const exists = mockDb.delphiResponses.some(
                r => r.round_id === record.round_id && r.member_id === record.member_id
              );
              if (exists) {
                const err = new Error('Anda sudah berpartisipasi dalam putaran ini.');
                err.statusCode = 400;
                throw err;
              }
              mockDb.delphiResponses.push(record);
            } else if (this.table === 'delphi_anp_responses') {
              const exists = mockDb.delphiAnpResponses.some(
                r => r.member_id === record.member_id
              );
              if (exists) {
                const err = new Error('Pakar ini sudah menyetor matriks keputusan.');
                err.statusCode = 400;
                throw err;
              }
              mockDb.delphiAnpResponses.push(record);
            } else if (this.table === 'delphi_rounds') {
              mockDb.delphiRounds.push(record);
            } else if (this.table === 'delphi_surveys') {
              mockDb.delphiSurveys.push(record);
            } else if (this.table === 'members') {
              const exists = mockDb.members.some(m => m.email.toLowerCase() === record.email.toLowerCase());
              if (exists) {
                const err = new Error('Email sudah terdaftar.');
                err.statusCode = 400;
                throw err;
              }
              mockDb.members.push(record);
            } else if (this.table === 'products') {
              mockDb.products.push(record);
            } else if (this.table === 'cart_items') {
              const existing = mockDb.cartItems.find(
                c => c.member_id === record.member_id && c.product_id === record.product_id
              );
              if (existing) {
                existing.quantity = record.quantity;
                newRecords.push(existing);
                continue;
              } else {
                mockDb.cartItems.push(record);
              }
            } else if (this.table === 'orders') {
              mockDb.orders.push(record);
            } else if (this.table === 'order_items') {
              mockDb.orderItems = mockDb.orderItems || [];
              mockDb.orderItems.push(record);
            } else if (this.table === 'investment_projects') {
              mockDb.investmentProjects.push(record);
            } else if (this.table === 'investments') {
              mockDb.investments.push(record);
            }
            newRecords.push(record);
          }
          resolve({ data: newRecords, error: null });
          return;
        }

        // --- 2. DELETE ---
        if (this.action === 'delete') {
          let list = [];
          if (this.table === 'cart_items') {
            list = mockDb.cartItems || [];
          } else if (this.table === 'products') {
            list = mockDb.products || [];
          } else if (this.table === 'members') {
            list = mockDb.members || [];
          } else if (this.table === 'delphi_surveys') {
            list = mockDb.delphiSurveys || [];
          } else if (this.table === 'delphi_rounds') {
            list = mockDb.delphiRounds || [];
          } else if (this.table === 'delphi_responses') {
            list = mockDb.delphiResponses || [];
          } else if (this.table === 'delphi_anp_responses') {
            list = mockDb.delphiAnpResponses || [];
          }

          const keptItems = list.filter(item => {
            for (const filter of this.filters) {
              if (filter.type === 'eq' && item[filter.column] === filter.value) {
                return false;
              }
            }
            return true;
          });

          list.length = 0;
          list.push(...keptItems);

          resolve({ data: { message: 'Deleted successfully' }, error: null });
          return;
        }

        // --- 3. UPDATE ---
        if (this.action === 'update') {
          let list = [];
          if (this.table === 'delphi_surveys') {
            list = mockDb.delphiSurveys || [];
          } else if (this.table === 'delphi_rounds') {
            list = mockDb.delphiRounds || [];
          } else if (this.table === 'members') {
            list = mockDb.members || [];
          } else if (this.table === 'products') {
            list = mockDb.products || [];
          } else if (this.table === 'cart_items') {
            list = mockDb.cartItems || [];
          } else if (this.table === 'investment_projects') {
            list = mockDb.investmentProjects || [];
          }

          let updatedCount = 0;
          const updatedRecords = [];
          for (const item of list) {
            let match = true;
            for (const filter of this.filters) {
              if (filter.type === 'eq' && item[filter.column] !== filter.value) {
                match = false;
                break;
              }
            }

            if (match) {
              Object.assign(item, this.payload);
              updatedCount++;
              updatedRecords.push(item);
            }
          }
          resolve({ data: updatedRecords, error: null });
          return;
        }

        // --- 4. SELECT ---
        let data = [];
        if (this.table === 'delphi_surveys') {
          data = JSON.parse(JSON.stringify(mockDb.delphiSurveys || []));
        } else if (this.table === 'delphi_rounds') {
          data = JSON.parse(JSON.stringify(mockDb.delphiRounds || []));
        } else if (this.table === 'delphi_responses') {
          data = JSON.parse(JSON.stringify(mockDb.delphiResponses || []));
        } else if (this.table === 'delphi_anp_responses') {
          data = JSON.parse(JSON.stringify(mockDb.delphiAnpResponses || []));
        } else if (this.table === 'delphi_experts') {
          data = JSON.parse(JSON.stringify(mockDb.delphiExperts || []));
        } else if (this.table === 'members') {
          data = JSON.parse(JSON.stringify(mockDb.members || []));
        } else if (this.table === 'products') {
          data = JSON.parse(JSON.stringify(mockDb.products || []));
        } else if (this.table === 'cart_items') {
          data = JSON.parse(JSON.stringify(mockDb.cartItems || [])).map(item => ({
            ...item,
            products: (mockDb.products || []).find(p => p.id === item.product_id)
          }));
        } else if (this.table === 'orders') {
          data = JSON.parse(JSON.stringify(mockDb.orders || []));
        } else if (this.table === 'order_items') {
          data = JSON.parse(JSON.stringify(mockDb.orderItems || []));
        } else if (this.table === 'investment_projects') {
          data = JSON.parse(JSON.stringify(mockDb.investmentProjects || []));
        } else if (this.table === 'investments') {
          data = JSON.parse(JSON.stringify(mockDb.investments || [])).map(item => ({
            ...item,
            investment_projects: (mockDb.investmentProjects || []).find(p => p.id === item.projectId)
          }));
        } else if (this.table === 'blockchain') {
          data = JSON.parse(JSON.stringify(mockDb.blockchain || []));
        }

        // Apply filters
        for (const filter of this.filters) {
          if (filter.type === 'eq') {
            data = data.filter(item => item[filter.column] === filter.value);
          }
        }

        // Apply order
        for (const order of this.orders) {
          data.sort((a, b) => {
            const valA = a[order.column];
            const valB = b[order.column];
            if (valA < valB) return order.ascending ? -1 : 1;
            if (valA > valB) return order.ascending ? 1 : -1;
            return 0;
          });
        }

        resolve({ data, error: null });
      } catch (err) {
        resolve({ data: null, error: { message: err.message } });
      }
    }
  };
};

const dbClient = {
  from(tableName) {
    return createMockQuery(tableName);
  }
};

module.exports = dbClient;
