
-- KEYS[1] = stock:{dropId}
-- KEYS[2] = idem:{userId}:{key}
-- ARGV[1] = qty
-- ARGV[2] = ttl seconds for idempotency key

local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local already = redis.call('GET', KEYS[2])

if already then
  return {1, tonumber(already)} -- idempotent hit
end

local qty = tonumber(ARGV[1])
if current < qty then
  return {0, current} -- not enough stock
end

local remaining = current - qty
redis.call('SET', KEYS[1], remaining)
redis.call('SETEX', KEYS[2], tonumber(ARGV[2]), remaining)
return {2, remaining} -- success
