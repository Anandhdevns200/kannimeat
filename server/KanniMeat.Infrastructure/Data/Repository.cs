using System.Linq.Expressions;

using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Data;

public sealed class Repository<TEntity> : IRepository<TEntity> where TEntity : BaseEntity
{
    private readonly AppDbContext _context;
    private readonly DbSet<TEntity> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<TEntity>();
    }

    public IQueryable<TEntity> Query(bool tracking = false)
        => tracking ? _dbSet.AsTracking() : _dbSet.AsNoTracking();

    public Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<TEntity?> GetByIdAsync(Guid id, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, CancellationToken ct = default)
        => include(_dbSet.AsNoTracking()).FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<IReadOnlyList<TEntity>> ListAsync(CancellationToken ct = default)
        => _dbSet.AsNoTracking().ToListAsync(ct).ContinueWith(x => (IReadOnlyList<TEntity>)x.Result, ct);

    public Task<IReadOnlyList<TEntity>> ListAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default)
        => _dbSet.AsNoTracking().Where(predicate).ToListAsync(ct).ContinueWith(x => (IReadOnlyList<TEntity>)x.Result, ct);

    public Task<IReadOnlyList<TEntity>> ListAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, CancellationToken ct = default)
        => include(_dbSet.AsNoTracking()).Where(predicate).ToListAsync(ct).ContinueWith(x => (IReadOnlyList<TEntity>)x.Result, ct);

    public Task<IReadOnlyList<TEntity>> ListAsync(
        Expression<Func<TEntity, bool>> predicate,
        Func<IQueryable<TEntity>, IQueryable<TEntity>> include,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy,
        CancellationToken ct = default)
        => orderBy(include(_dbSet.AsNoTracking()).Where(predicate)).ToListAsync(ct).ContinueWith(x => (IReadOnlyList<TEntity>)x.Result, ct);

    public Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default)
        => _dbSet.AsNoTracking().FirstOrDefaultAsync(predicate, ct);

    public Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, CancellationToken ct = default)
        => include(_dbSet.AsNoTracking()).FirstOrDefaultAsync(predicate, ct);

    public Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default)
        => _dbSet.AsNoTracking().AnyAsync(predicate, ct);

    public Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken ct = default)
        => predicate is null ? _dbSet.CountAsync(ct) : _dbSet.CountAsync(predicate, ct);

    public async Task AddAsync(TEntity entity, CancellationToken ct = default)
        => await _dbSet.AddAsync(entity, ct);

    public void Update(TEntity entity) => _dbSet.Update(entity);

    public void Remove(TEntity entity) => _dbSet.Remove(entity);

    public Task SaveChangesAsync(CancellationToken ct = default) => _context.SaveChangesAsync(ct);
}